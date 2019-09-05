import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DataStorageService } from "./shared/data-storage.service";
import * as _ from "lodash";
import { MatStepper } from '@angular/material';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  isLinear = true;
  thirdFormGroup: FormGroup;
  allOrgs = [] ;
  firstStepChange ;
  secondStepChange ;
  thirdStepChange ;
  isLoading=false;
  isError = false;
  error = "";

  userRoles

  constructor(
    private _formBuilder: FormBuilder,
    private dataStorageService: DataStorageService
  ) {}

  ngOnInit() {
    this.reset();
  }

  async getAllOrgs() {
    this.isLoading = true;
    let orgs = await this.dataStorageService.getOrganisations();
    if (!_.isEmpty(orgs)) {
      if (!_.isNil(orgs.founder)) {
        this.allOrgs.push({ name: orgs.founder, value: false });
      }
      if (!_.isNil(orgs.participants) && !_.isEmpty(orgs.participants)) {
        _.each(orgs.participants, p => {
          this.allOrgs.push({ name: p, value: false });
        });
      }
    }
this.isLoading= false;
    console.log(this.allOrgs);
  }

  stepChangeOne() {
    this.firstStepChange = true;
    console.log(this.allOrgs);
  }

  stepChangeTwo() {
    this.secondStepChange = true;
    console.log(this.userRoles);
  }

  async formSubmit() {
    console.log(this.thirdFormGroup.value);
    this.isLoading = true;
    let userObj = {
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      userName: this.thirdFormGroup.value.email,
      name: {
        familyName: this.thirdFormGroup.value.lastName,
        givenName: this.thirdFormGroup.value.firstName
      },
      password: this.thirdFormGroup.value.password,
      emails: [
        {
          value: this.thirdFormGroup.value.email,
          type: "work",
          primary: true
        }
      ]
    };
    try {
      let token = await this.dataStorageService.getAccessToken();

      let user  = await this.dataStorageService.createUser(userObj, token.access_token);

      for (let i = 0; i < this.allOrgs.length; i++) {
        if (this.allOrgs[i].value === true) {
          let appRoles = await this.dataStorageService.getAppRoles(
            this.allOrgs[i].name,
            token.access_token
          );
          console.log(appRoles);
          let that = this;
          let rolesToAdd = _.filter(appRoles.Resources, role => {
            return (
              that.userRoles.findIndex(
                i => i.displayName === role.displayName && i.isSelected
              ) >= 0
            );
          });
          console.log(rolesToAdd);
          for (let j = 0; j < rolesToAdd.length; j++) {
            let addObj = {
              app: {
                value: rolesToAdd[j].app.value
              },
              entitlement: {
                attributeName: "appRoles",
                attributeValue: rolesToAdd[j].id
              },
              grantMechanism: "ADMINISTRATOR_TO_USER",
              grantee: {
                value: user.id,
                type: "User"
              },
              schemas: ["urn:ietf:params:scim:schemas:oracle:idcs:Grant"]
            };

            console.log(addObj);
            await this.dataStorageService.addApprole(addObj, token.access_token)
          }
        }
      }

      this.isLoading = false;
    } catch (e) {
      this.isLoading = false;
      this.isError = true;
      this.error = JSON.parse(e._body).detail;
      console.log(e);
    }
    this.thirdStepChange = true;
  }

  reset() {
    this.allOrgs = [];
    this.isError = false;
    this.isLoading = false;
    this.error = "";
    this.getAllOrgs();
    this.firstStepChange = false;
    this.secondStepChange = false;
    this.thirdStepChange = false;

    this.userRoles = [
      { displayName: "BCS ADMINISTRATOR", isSelected: false },
      { displayName: "RESTPROXY1_ADMIN", isSelected: false },
      { displayName: "RESTPROXY1_USER", isSelected: false },
      { displayName: "RESTPROXY2_ADMIN", isSelected: false },
      { displayName: "RESTPROXY2_USER", isSelected: false },
      { displayName: "RESTPROXY3_ADMIN", isSelected: false },
      { displayName: "RESTPROXY3_USER", isSelected: false },
      { displayName: "RESTPROXY4_ADMIN", isSelected: false },
      { displayName: "RESTPROXY4_USER", isSelected: false }
    ];

    this.thirdFormGroup = this._formBuilder.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      email: ["", Validators.required],
      password: ["", Validators.required]
    });
  }

  resetStepper(stepper: MatStepper){
    stepper.selectedIndex = 0;
    this.reset();
 }
}
