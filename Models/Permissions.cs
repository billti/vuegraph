namespace vuegraph;

public class User
{
    public string? Org { get; set; }
    public string? DisplayName { get; set; }
    public List<string>? Acl { get; set; }
}

public class Permissions
{
    public List<string>? Orgs { get; set; }
    public Dictionary<string, User>? Users { get; set; }
}
