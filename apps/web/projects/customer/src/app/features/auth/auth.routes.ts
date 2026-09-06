import type { Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";

export const authRoutes: Routes = [
  { path: "login", component: LoginComponent, title: "Anmelden" },
  { path: "register", component: RegisterComponent, title: "Registrieren" },
];
