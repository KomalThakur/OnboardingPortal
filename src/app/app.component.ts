import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DataStorageService } from "./shared/data-storage.service";
import * as _ from "lodash";
import { MatStepper } from "@angular/material";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  isLinear = true;
  thirdFormGroup: FormGroup;
  thirdFormGroupOrg: FormGroup;
  thirdFormGroupUser: FormGroup;
  allOrgs = [];
  firstStepChange;
  secondStepChange;
  thirdStepChange;
  firstStepChangeOrg;
  secondStepChangeOrg;
  isLoading = false;
  isError = false;
  error = "";

  generatedUserName = null;

  userRoles;
  userGroups;

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
    this.isLoading = false;
    console.log(this.allOrgs);
  }

  stepChangeOne() {
    this.firstStepChange = true;
    console.log(this.allOrgs);
  }

  stepChangeOneOrg() {
    this.firstStepChangeOrg = true;
  }

  stepChangeTwo() {
    this.secondStepChange = true;
    console.log(this.userRoles);
  }

  stepChangeTwoOrg() {
    this.secondStepChangeOrg = true;
  }

  async formSubmit() {
    console.log(this.thirdFormGroup.value);
    this.isLoading = true;
    try {
      let token = await this.dataStorageService.getAccessToken();

      let usernameObj = await this.dataStorageService.generateUserName(
        {
          email: this.thirdFormGroup.value.email,
          schemas: [
            "urn:ietf:params:scim:schemas:oracle:idcs:UserNameGenerator"
          ]
        },
        token.access_token
      );

      this.generatedUserName = usernameObj.generatedUserName;

      let userObj = {
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
        userName: this.generatedUserName,
        name: {
          familyName: this.thirdFormGroup.value.lastName,
          givenName: this.thirdFormGroup.value.firstName
        },
        password: "TestPass@123<>?",
        emails: [
          {
            value: this.thirdFormGroup.value.email,
            type: "work",
            primary: true
          }
        ]
      };

      let user = await this.dataStorageService.createUser(
        userObj,
        token.access_token
      );

      await this.dataStorageService.changePassword(
        {
          password: this.thirdFormGroup.value.password,
          schemas: [
            "urn:ietf:params:scim:schemas:oracle:idcs:UserPasswordChanger"
          ]
        },
        user.id,
        token.access_token
      );

      let adminRole = await this.dataStorageService.getAdminRoles(
        token.access_token
      );
      let addObj1 = {
        app: {
          value: adminRole.Resources[0].app.value
        },
        entitlement: {
          attributeName: "appRoles",
          attributeValue: adminRole.Resources[0].id
        },
        grantMechanism: "ADMINISTRATOR_TO_USER",
        grantee: {
          value: user.id,
          type: "User"
        },
        schemas: ["urn:ietf:params:scim:schemas:oracle:idcs:Grant"]
      };

      console.log(addObj1);
      await this.dataStorageService.addApprole(addObj1, token.access_token);

      for (let i = 0; i < this.allOrgs.length; i++) {
        if (this.allOrgs[i].value === true) {
          for (let i = 0; i < this.userGroups.length; i++) {
            if (this.userGroups[i].isSelected) {
              let grp = await this.dataStorageService.getGroups(
                this.userGroups[i].displayName,
                token.access_token
              );
              await this.dataStorageService.addUserToGroup(
                {
                  schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
                  Operations: [
                    {
                      op: "add",
                      path: "members",
                      value: [
                        {
                          value: user.id,
                          type: "User"
                        }
                      ]
                    }
                  ]
                },
                grp.Resources[0].id,
                token.access_token
              );
            }
          }
          let appRoles = await this.dataStorageService.getAppRoles(
            this.allOrgs[i].name,
            token.access_token
          );
          let that = this;
          let rolesToAdd = _.filter(appRoles.Resources, role => {
            return (
              that.userRoles.findIndex(
                i => i.displayName === role.displayName && i.isSelected
              ) >= 0
            );
          });
          console.log("roles to add : ", rolesToAdd);
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
            await this.dataStorageService.addApprole(
              addObj,
              token.access_token
            );
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
    this.generatedUserName = null;
    this.getAllOrgs();
    this.firstStepChange = false;
    this.secondStepChange = false;
    this.thirdStepChange = false;
    this.firstStepChangeOrg = false;
    this.secondStepChangeOrg = false;

    this.userRoles = [
      {
        displayName: "BCS ADMINISTRATOR",
        isSelected: false,
        alias: "Admin User"
      },
      { displayName: "RESTPROXY_USER", isSelected: false, alias: "App User" }
    ];

    this.userGroups = [
      { displayName: "Icledger_buyer", isSelected: false, alias: "Buyer" },
      { displayName: "Icledger_seller", isSelected: false, alias: "Seller" },
      { displayName: "Icledger_treasury", isSelected: false, alias: "Treasury" }
    ];

    this.thirdFormGroup = this._formBuilder.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      email: ["", Validators.required],
      password: ["", Validators.required]
    });

    this.thirdFormGroupUser = this._formBuilder.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      email: ["", Validators.required],
      password: ["", Validators.required]
    });

    this.thirdFormGroupOrg = this._formBuilder.group({
      orgName: ["", Validators.required],
      addressLine1: ["", Validators.required],
      addressLine2: [""],
      contact: ["", Validators.required]
    });
  }

  resetStepper(stepper: MatStepper) {
    stepper.selectedIndex = 0;
    this.reset();
  }

  changeTab() {
    console.log("tab changed");
    this.reset();
  }

  async orgFormSubmit() {
    console.log(this.thirdFormGroupOrg);
    console.log(this.thirdFormGroupUser);
    console.log(this.allOrgs);
    this.isLoading = true;

    try {
      let validOrgsObj = _.filter(this.allOrgs, obj =>
        /^ICNewOrg/.test(obj.name)
      );
      let validOrgs = [];
      _.each(validOrgsObj, ele => {
        validOrgs.push(ele.name);
      });
      console.log(validOrgs);
      let returnData = await this.dataStorageService.getOrgsFromBlockchain();
      let mappedOrgs = [];
      _.each(JSON.parse(returnData.result.payload), ele => {
        if (ele.Record.orgname === this.thirdFormGroupOrg.value.orgName) {
          throw new Error("Org name already exist");
        }
        mappedOrgs.push(ele.Key);
      });

      console.log("mapped Orgs ", mappedOrgs);
      let toMapArr = _.difference(validOrgs, mappedOrgs);
      console.log("toMapArr", toMapArr);

      let token = await this.dataStorageService.getAccessToken();
      if (toMapArr.length > 0) {
        let usernameObj = await this.dataStorageService.generateUserName(
          {
            email: this.thirdFormGroupUser.value.email,
            schemas: [
              "urn:ietf:params:scim:schemas:oracle:idcs:UserNameGenerator"
            ]
          },
          token.access_token
        );

        this.generatedUserName = usernameObj.generatedUserName;

        let userObj = {
          schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
          userName: usernameObj.generatedUserName,
          name: {
            familyName: this.thirdFormGroupUser.value.lastName,
            givenName: this.thirdFormGroupUser.value.firstName
          },
          password: "TestPass@123<>?",
          emails: [
            {
              value: this.thirdFormGroupUser.value.email,
              type: "work",
              primary: true
            }
          ]
        };

        let user = await this.dataStorageService.createUser(
          userObj,
          token.access_token
        );

        await this.dataStorageService.changePassword(
          {
            password: this.thirdFormGroupUser.value.password,
            schemas: [
              "urn:ietf:params:scim:schemas:oracle:idcs:UserPasswordChanger"
            ]
          },
          user.id,
          token.access_token
        );

        let adminRole = await this.dataStorageService.getAdminRoles(
          token.access_token
        );
        let addObj1 = {
          app: {
            value: adminRole.Resources[0].app.value
          },
          entitlement: {
            attributeName: "appRoles",
            attributeValue: adminRole.Resources[0].id
          },
          grantMechanism: "ADMINISTRATOR_TO_USER",
          grantee: {
            value: user.id,
            type: "User"
          },
          schemas: ["urn:ietf:params:scim:schemas:oracle:idcs:Grant"]
        };
  
        console.log(addObj1);
        await this.dataStorageService.addApprole(addObj1, token.access_token);

        for (let i = 0; i < this.userGroups.length; i++) {
          if (this.userGroups[i].isSelected) {
            let grp = await this.dataStorageService.getGroups(
              this.userGroups[i].displayName,
              token.access_token
            );
            await this.dataStorageService.addUserToGroup(
              {
                schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
                Operations: [
                  {
                    op: "add",
                    path: "members",
                    value: [
                      {
                        value: user.id,
                        type: "User"
                      }
                    ]
                  }
                ]
              },
              grp.Resources[0].id,
              token.access_token
            );
          }
        }
        let appRoles = await this.dataStorageService.getAppRoles(
          toMapArr[0],
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
        console.log("roles to add : ", rolesToAdd);
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

          console.log("roles add obj ", addObj);
          await this.dataStorageService.addApprole(addObj, token.access_token);
        }

        let address = this.thirdFormGroupOrg.value.addressLine1;
        if (!_.isEmpty(this.thirdFormGroupOrg.value.addressLine2)) {
          address += ", ";
          address += this.thirdFormGroupOrg.value.addressLine2;
        }
        console.log("blockchain add data : ", [
          toMapArr[0],
          this.thirdFormGroupOrg.value.orgName,
          this.thirdFormGroupUser.value.email,
          this.thirdFormGroupUser.value.password,
          this.thirdFormGroupUser.value.firstName,
          this.thirdFormGroupUser.value.lastName,
          address,
          this.thirdFormGroupOrg.value.contact
        ]);
        await this.dataStorageService.addOrgToBlockchain([
          toMapArr[0],
          this.thirdFormGroupOrg.value.orgName,
          usernameObj.generatedUserName,
          this.thirdFormGroupUser.value.password,
          this.thirdFormGroupUser.value.firstName,
          this.thirdFormGroupUser.value.lastName,
          address,
          this.thirdFormGroupOrg.value.contact
        ]);
      } else {
        this.isError = true;
        this.error = "No Organisation Available";
      }
      this.isLoading = false;
    } catch (e) {
      this.isLoading = false;
      this.isError = true;
      console.log(e);
      console.log(typeof e);
      if (e.message) {
        this.error = e.message;
      } else {
        this.error = JSON.parse(e._body).detail;
      }
    }
    this.secondStepChangeOrg = true;
  }
}
