import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import { Headers, RequestOptions } from "@angular/http";

@Injectable({
  providedIn: "root"
})
export class DataStorageService {
  obpBaseUrl = "https://iccorporate-oabcs1.blockchain.ocp.oraclecloud.com:443";
  idcsBaseUrl =
    "https://idcs-77c15f1e68604c058062a4220f5601d0.identity.oraclecloud.com";
  constructor(private http: Http) {}

  public getOrganisations() {
    return this.http
      .get(this.obpBaseUrl + "/console/admin/api/v1.1/organizations", {
        headers: new Headers({
          "Content-Type": "application/json",
          Authorization: "Basic aWNsZWRnZXI6V2VsY29tZSMxMjM0NQ=="
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
        .get(this.idcsBaseUrl + `/admin/v1/AppRoles?filter=app.display+eq+"OABCSINST_${appName}"`, {
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
}
