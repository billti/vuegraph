using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace vuegraph.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class PermissionsController : ControllerBase
{
    private readonly ILogger<PermissionsController> _logger;
    private readonly PermissionsService _permissions;

    public PermissionsController(ILogger<PermissionsController> logger, PermissionsService permissions)
    {
        _logger = logger;
        _permissions = permissions;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Permissions))]
    public IActionResult Get()
    {
        Permissions result = _permissions.GetPermissions();
        return new JsonResult(result, PermissionsService.JsonOptions);
    }
}
