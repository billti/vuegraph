if ($PSVersionTable.PSVersion.Major -lt 7) {
    throw "Use at least PowerShell 7"
}

$azVersion = (Get-Module -Name Az -ListAvailable).Version
$graphVersion = (Get-Module -Name Microsoft.Graph -ListAvailable).Version
# $azureADVersion = (Get-Module -Name AzureADPreview -ListAvailable).Version

if ($null -eq $azVersion) {
    throw "Module Az not detected. Install with: Install-Module -Name Az"
}

if ($azVersion -lt [Version]::new(6, 2, 1) ) {
    throw "Installed Az module version needs to be updated"
}

if ($null -eq $graphVersion) {
    throw "Module Microsoft.Graph not detected. Install with: Install-Module -Name Microsoft.Graph"
}

if ($graphVersion -lt [Version]::new(1, 9, 1) ) {
    throw "Installed Microsoft.Graph module version needs to be updated"
}

# Note: AzureAD is not recommended any more.
# See https://docs.microsoft.com/en-us/powershell/microsoftgraph/overview

# if ($null -eq $azureADVersion) {
#     throw "Module AzureADPreview not detected. Install with: Install-Module -Name AzureADPreview"
# }
# 
# if ($azureADVersion -lt [Version]::new(2, 0, 2) ) {
#     throw "Installed AzureADPreview module version needs to be updated"
# }

# Not sure why this is needed before commands can be used. Should be auto-imported on use.
# Maybe as this is a 'Desk' only module, and not 'Core'?
# Import-Module -Name AzureADPreview

# Note: Most useful Graph commands for AzureAD are in Microsoft.Graph.Applications.
# See https://docs.microsoft.com/en-us/powershell/module/microsoft.graph.applications


Connect-MgGraph -Scopes "User.Read.All","Directory.ReadWrite.All" -TenantId "a8257b21-ac35-4244-9f9e-17c2ea736263"

# List all the permission grants in the tenant
Get-MgOauth2PermissionGrant
# PrincipalId is the user account Id
# ResourceId is the ServicePrincipal id for the resource app
# ClientId is the ServicePrincipal id for the client app

# See apps homed in the tenant
$myTenant = (Get-MgContext).TenantId
Get-MgServicePrincipal | Where-Object {$_.AppOwnerOrganizationId -eq $myTenant}

# Get the Microsoft.Graph app in the tenant
$graph = Get-MgServicePrincipal | Where-Object {$_.DisplayName -eq "Microsoft Graph" }
# Or: Get-MgServicePrincipal -Filter "AppId eq '00000003-0000-0000-c000-000000000000'"
# Or to get all 'Microsoft*' apps: Get-MgServicePrincipal -Filter "startswith(displayName, 'Microsoft')"

# See all the scopes on it
$graph.Oauth2PermissionScopes | Format-Table -Property Id,Value,Type,UserConsentDisplayName

# See the full description for all the "User.*" scopes
$graph.Oauth2PermissionScopes | Where-Object {$_.Value -like "User.*"} | Format-Table -Property Id,Value,Type,UserConsentDescription

# See all the commands for dealing with OAuth
Get-Command *oauth2* -Module Microsoft.Graph.*

# Remove all consents
$me = Get-MgUser -Filter "UserPrincipalName eq 'bill@billti.dev'"

Get-MgApplication
# AppId is the client_id
# Id is ??


# How to list all the grants showing the user and app names
$users = Get-MgUser
$sps = Get-MgServicePrincipal
$grants = Get-MgOauth2PermissionGrant

#Create dictionaries mapping Ids to friendly names

$userToUpn = @{}
$users | ForEach-Object {$userToUpn.Add($_.Id, ($_.UserPrincipalName))}

$spToName = @{}
$sps | ForEach-Object {$spToName.Add($_.Id, $_.DisplayName)}

$grants | Sort-Object -Property PrincipalId, ClientId  | Format-Table `
    @{ name='User';      expr={$userToUpn[$_.PrincipalId]}; width=40}, 
    @{ name='ClientApp'; expr={$spToName[$_.ClientId]} }, 
    @{ name='Resource';  expr={$spToName[$_.ResourceId]} },
    Scope


# Setting a manager, see https://docs.microsoft.com/en-us/graph/api/user-post-manager?view=graph-rest-1.0&tabs=powershell#example
# See also https://github.com/microsoftgraph/msgraph-sdk-powershell/issues/375#issuecomment-698609524

# Creating client apps with PowerShell: https://github.com/microsoftgraph/msgraph-sdk-powershell/blob/dev/samples/9-Applications.ps1