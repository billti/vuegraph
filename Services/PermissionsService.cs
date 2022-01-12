using System.Text.Json;
using System.Text.Json.Serialization;

namespace vuegraph;

// Simple provider that just returns the contents of a local file for this demo.
public class PermissionsService
{
    public static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    private readonly ILogger<PermissionsService> _logger;
    private Permissions _permissions;

    public PermissionsService(ILogger<PermissionsService> logger, IWebHostEnvironment env)
    {
        _logger = logger;
        string permissionsFile = env.ContentRootFileProvider.GetFileInfo("./Models/sampleUsers.json").PhysicalPath;
        string permissionsText = File.ReadAllText(permissionsFile);
        _logger.LogInformation("Read {bytes} bytes from {file}", permissionsText.Length, permissionsFile);

        _permissions = JsonSerializer.Deserialize<Permissions>(permissionsText, JsonOptions)
                ?? throw new ApplicationException("Unable to parse permissions JSON file");
    }

    public Permissions GetPermissions()
    {
        return _permissions;
    }
}
