import { acquireTokenSilentOrPopup } from "./auth";

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

// Tip: Find actual OIDs by going to Graph Explorer (aka.ms/ge) and running queries such as:
// https://graph.microsoft.com/v1.0/users/joe@contoso.com
// Or alternatively from Az PowerShell: Get-AzADUser -DisplayName "Bill Ticehurst"

// Example of a user permissions document
export const exampleDocument: UserPermissions = {
  "orgs": ["Microsoft", "Contoso"],
  "users": {
    "a8257b21-ac35-4244-9f9e-17c2ea736263.68395d36-8beb-4cb5-ae20-79250b1cf3c9": {
      "org": "Microsoft",
      "displayName": "Bill Ticehurst",
      "acl": ["Global:Admin", "Global:Reviewer", "Global:Publisher", "Microsoft:Contributor"]
    },
    "a8257b21-ac35-4244-9f9e-17c2ea736263.130180d7-e49e-4d28-a6ed-1667a7ee7a35": {
      "org": "Microsoft",
      "displayName": "Joe Dirt",
      "acl": ["Global:Admin", "Microsoft:Reader", "Microsoft:Reviewer"]
    },
    "a8257b21-ac35-4244-9f9e-17c2ea736263.8e7bd652-2057-4de4-b540-d4892660e36c": {
      "org": "Microsoft",
      "displayName": "Mike Tyson",
      "acl": ["Microsoft:Reader", "Microsoft:Publisher", "Contoso:Publisher"]
    },
    "a8257b21-ac35-4244-9f9e-17c2ea736263.8ef3596f-b491-4222-b864-25949209fe7c": {
      "org": "Microsoft",
      "displayName": "Snow White",
      "acl": ["Global:Reader", "Global:Reviewer", "Global:Publisher"]
    },
    "a8257b21-ac35-4244-9f9e-17c2ea736263.08a538bb-9e42-4001-95fd-4bdb9cb673de": {
      "org": "Microsoft",
      "displayName": "Pit Bull",
      "acl": ["Microsoft:Reader", "Microsoft:Creator"]
    },
    "a8257b21-ac35-4244-9f9e-17c2ea736263.8bd714be-02e3-43ee-843a-9ec7f33b45f0": {
      "org": "Contoso",
      "displayName": "Ariana Grande",
      "acl": ["Contoso:Reviewer", "Contoso:Contributor"]
    },
    "a8257b21-ac35-4244-9f9e-17c2ea736263.ff2d16eb-a247-44ec-8db3-5a768dd2b33c": {
      "org": "Contoso",
      "displayName": "Test User",
      "acl": ["Contoso:Reader", "Contoso:Reviewer", "Contoso:Contributor"]
    }
  }
};

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
