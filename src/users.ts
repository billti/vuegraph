import { acquireTokenSilentOrPopup, appScope } from "./auth";

export interface UserPermissions {
    orgs: Array<string>;
    users: {
        [accountId: string]: {
            org: string;
            displayName: string;
            acl: string[];
        }
    };
}

export async function GetPermissions() : Promise<UserPermissions> {
  let oauthToken = (await acquireTokenSilentOrPopup([appScope])).accessToken;
  let result = await axios.get("/api/permissions", {headers: {"Authorization": `Bearer ${oauthToken}`}});

  if (result.status !== 200) throw `Failed to fetch permissions. Error: ${result.statusText}`;

  let permissions = result.data as UserPermissions;
  if (!permissions.orgs || !permissions.users) throw `Invalid permissions response: ${result.data}`;
  return permissions;
}

export async function GetProfilePic(oid: string): Promise<string | null> {
    // Need a token with User.BasicRead.All to access other people's photos
    // See https://docs.microsoft.com/en-us/graph/permissions-reference#user-permissions
    // All users in an org should be able to search for folks. See https://docs.microsoft.com/en-us/graph/permissions-reference#user-and-group-search-limitations-for-guest-users-in-organizations

    let oauthToken = (await acquireTokenSilentOrPopup(["User.ReadBasic.All"])).accessToken;

    let result = await axios.get(`https://graph.microsoft.com/v1.0/users/${oid}/photo/$value`, {
        responseType: "blob",
        headers: { "Authorization": `Bearer ${oauthToken}`}
    });

    if (result.status === 200 && result.headers?.["content-type"] && (result.headers["content-type"] as string).startsWith("image/")) {
        // Set the image tag 'src' attribute to the result returned
        return URL.createObjectURL(result.data);
    }
    return null;
}

export interface SearchUsersResult {
    "id": string;
    "displayName": string;
    "userPrincipalName": string;
};

export async function SearchUsers(term: string): Promise<SearchUsersResult[]> {
    // See examples at https://docs.microsoft.com/en-us/graph/api/user-list

    const baseUrl = "https://graph.microsoft.com/v1.0/users";
    const params = "$orderby=displayName&$top=20";
    const filter = `$search="displayName: ${term}" OR "mail:${term}"`;

    let oauthToken = (await acquireTokenSilentOrPopup(["User.ReadBasic.All"])).accessToken;

    let result = await axios.get(`${baseUrl}?${filter}&${params}`, {
        headers: { "Authorization": `Bearer ${oauthToken}`, "ConsistencyLevel": "eventual" }
    });

    /* Result is an array of objects such as:
    {
        "displayName": "Ariana Grande",
        "givenName": "Ariana",
        "surname": "Grande",
        "userPrincipalName": "ariana@billti.dev",
        "id": "8bd714be-02e3-43ee-843a-9ec7f33b45f0"
    } */

    if (result.status === 200) {
        let payload: SearchUsersResult[] = result.data?.value || [];
        return payload;
    } else {
        throw `User search failed with status: ${result.status}`;
    }
}
