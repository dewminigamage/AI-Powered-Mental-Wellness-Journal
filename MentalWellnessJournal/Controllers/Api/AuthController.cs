using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MentalWellnessJournal.Models;
using MentalWellnessJournal.Services;

namespace MentalWellnessJournal.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly JwtService _jwt;

        public AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, JwtService jwt)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwt = jwt;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            var user = new ApplicationUser
            {
                FullName = req.FullName,
                Email = req.Email,
                UserName = req.Email,
                StudentId = req.StudentId,
                Department = req.Department,
                DateOfBirth = req.DateOfBirth
            };

            var result = await _userManager.CreateAsync(user, req.Password);
            if (!result.Succeeded)
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

            await _userManager.AddToRoleAsync(user, "Student");
            var roles = await _userManager.GetRolesAsync(user);
            return Ok(BuildAuthResponse(user, roles));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var user = await _userManager.FindByEmailAsync(req.Email);
            if (user == null || !user.IsActive)
                return Unauthorized(new { message = "Invalid credentials or account deactivated." });

            var result = await _signInManager.CheckPasswordSignInAsync(user, req.Password, lockoutOnFailure: true);
            if (result.IsLockedOut) return Unauthorized(new { message = "Account locked. Try again later." });
            if (!result.Succeeded) return Unauthorized(new { message = "Invalid email or password." });

            var roles = await _userManager.GetRolesAsync(user);
            return Ok(BuildAuthResponse(user, roles));
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();
            var roles = await _userManager.GetRolesAsync(user);
            return Ok(new
            {
                user.Id, user.FullName, user.Email, user.StudentId, user.Department,
                user.DateOfBirth, user.CreatedAt, roles
            });
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            user.FullName = req.FullName;
            user.StudentId = req.StudentId;
            user.Department = req.Department;
            user.DateOfBirth = req.DateOfBirth;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

            var roles = await _userManager.GetRolesAsync(user);
            return Ok(BuildAuthResponse(user, roles));
        }

        [HttpPut("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
        {
            if (req.NewPassword != req.ConfirmPassword)
                return BadRequest(new { message = "Passwords do not match." });

            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var result = await _userManager.ChangePasswordAsync(user, req.CurrentPassword, req.NewPassword);
            if (!result.Succeeded)
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

            return Ok(new { message = "Password changed successfully." });
        }

        private object BuildAuthResponse(ApplicationUser user, IList<string> roles) => new
        {
            token = _jwt.GenerateToken(user, roles),
            user = new { user.Id, user.FullName, user.Email, user.StudentId, user.Department, roles }
        };
    }

    public record RegisterRequest(string FullName, string Email, string Password, string? StudentId, string? Department, DateTime DateOfBirth);
    public record LoginRequest(string Email, string Password);
    public record UpdateProfileRequest(string FullName, string? StudentId, string? Department, DateTime DateOfBirth);
    public record ChangePasswordRequest(string CurrentPassword, string NewPassword, string ConfirmPassword);
}
