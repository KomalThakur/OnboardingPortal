import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import { Headers, RequestOptions } from "@angular/http";

@Injectable({
  providedIn: "root"
})
export class DataStorageService {
  // old booth instance
  // obpBaseUrl = "https://iccorporate-oabcs1.blockchain.ocp.oraclecloud.com:443";
  // idcsBaseUrl =
  //   "https://idcs-77c15f1e68604c058062a4220f5601d0.identity.oraclecloud.com";
  // restProxyUrl =
  //   "https://7ED46BA56B1248BE9DABC941F63C617A.blockchain.ocp.oraclecloud.com:443/restproxy1/bcsgw/rest/v1/transaction";
  
  // auth= "Basic aWNsZWRnZXI6V2VsY29tZSMxMjM0NQ=="

  //new booth instance

  obpBaseUrl = "https://honest3pl-oabcs1.blockchain.ocp.oraclecloud.com:443";
  idcsBaseUrl =
    "https://idcs-77c15f1e68604c058062a4220f5601d0.identity.oraclecloud.com";
  restProxyUrl =
    "https://F969CA47421242DFB90E506F7A3C366B.blockchain.ocp.oraclecloud.com:443/restproxy1/bcsgw/rest/v1/transaction";
  
  auth= "Basic aWNsZWRnZXI6V2VsY29tZSMxMjM0NQ=="
  
    constructor(private http: Http) {}

  public getOrganisations() {
    return this.http
      .get(this.obpBaseUrl + "/console/admin/api/v1.1/organizations", {
        headers: new Headers({
          "Content-Type": "application/json",
          Authorization: this.auth
        })
      })
      .toPromise()
      .then(response => {
        return response.json();
      })
      .catch(err => {
        console.log(err.json());
        throw err.json();
      });
  }

  public getAccessToken() {
    return this.http
      .post(
        this.idcsBaseUrl + "/oauth2/v1/token",
        "grant_type=client_credentials&scope=urn%3Aopc%3Aidm%3A__myscopes__",
        {
          headers: new Headers({
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
              "Basic YjY1MTJlNjBjNTZjNGIyNGEyNTAwOWQxMmExYmE5N2M6M2ExZGU1YWMtMTBlNC00MzI0LWE0NDQtZWQ4MGNmOWIyYzVi"
          })
        }
      )
      .toPromise()
      .then(response => {
        return response.json();
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  }

  public getAppRoles(appName, token) {
    console.log("inside get App roles service", appName);
    return this.http
      .get(
        this.idcsBaseUrl +
          `/admin/v1/AppRoles?filter=app.display+eq+"OABCSINST_${appName}"`,
        {
          headers: new Headers({
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          })
        }
      )
      .toPromise()
      .then(response => {
        return response.json();
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  }

  public getAdminRoles( token) {
    console.log("inside get App roles service");
    return this.http
      .get(
        this.idcsBaseUrl +
          `/admin/v1/AppRoles?filter=displayName+sw+"OBC"`,
        {
          headers: new Headers({
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          })
        }
      )
      .toPromise()
      .then(response => {
        return response.json();
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  }

  public getGroups(name, token) {
    console.log("inside get group service", name);
    return this.http
      .get(
        this.idcsBaseUrl +
          `/admin/v1/Groups?filter=displayName+eq+"${name}"`,
        {
          headers: new Headers({
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          })
        }
      )
      .toPromise()
      .then(response => {
        return response.json();
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  }


  public createUser(userObj, token) {
    console.log("inside create user service", userObj);

    return this.http
      .post(this.idcsBaseUrl + "/admin/v1/Users", userObj, {
        headers: new Headers({
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        })
      })
      .toPromise()
      .then(response => {
        return response.json();
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  }

  public generateUserName(userObj, token) {
    console.log("inside create user service", userObj);

    return this.http
      .post(this.idcsBaseUrl + "/admin/v1/UserNameGenerator", userObj, {
        headers: new Headers({
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        })
      })
      .toPromise()
      .then(response => {
        return response.json();
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  }

  public addUserToGroup(userObj, id, token) {
    console.log("inside create user service", userObj);

    return this.http
      .patch(this.idcsBaseUrl + "/admin/v1/Groups/" + id, userObj, {
        headers: new Headers({
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        })
      })
      .toPromise()
      .then(response => {
        return response.json();
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  }

  public addApprole(roleObj, token) {
    console.log("inside add app role service", roleObj);
    return this.http
      .post(this.idcsBaseUrl + "/admin/v1/Grants", roleObj, {
        headers: new Headers({
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        })
      })
      .toPromise()
      .then(response => {
        return response.json();
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  }

  public changePassword(passwordObj, id, token) {
    console.log("inside change password service", passwordObj);
    return this.http
      .put(
        this.idcsBaseUrl + "/admin/v1/UserPasswordChanger/" + id,
        passwordObj,
        {
          headers: new Headers({
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          })
        }
      )
      .toPromise()
      .then(response => {
        return response.json();
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  }

  public getOrgsFromBlockchain() {
    console.log("inside get orgs service");
    return this.http
      .post(
        this.restProxyUrl + "/query",
        {
          channel: "icledger",
          chaincode: "ic-ledger-Organisations",
          method: "queryOrg",
          args: [
            '{"selector":{"docType":"Organisations", "orgid": {"$regex": "^ICNewOrg"}}}'
          ],
          chaincodeVer: "v1"
        },
        {
          headers: new Headers({
            "Content-Type": "application/json",
            Authorization: this.auth
          })
        }
      )
      .toPromise()
      .then(response => {
        return response.json();
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  }

  public addOrgToBlockchain(data) {
    console.log("inside add org service");
    return this.http
      .post(
        this.restProxyUrl + "/invocation",
        {
          channel: "icledger",
          chaincode: "ic-ledger-Organisations",
          method: "addorg",
          args:  
            data
          ,
          chaincodeVer: "v1"
        },
        {
          headers: new Headers({
            "Content-Type": "application/json",
            Authorization: this.auth
          })
        }
      )
      .toPromise()
      .then(response => {
        return response.json();
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  }


}
