import { Routes } from '@angular/router';
import { ProductsComponent } from '../components/products/products.component';
import { SignupComponent } from '../components/signup/signup.component';
import { HelppageComponent } from '../components/helppage/helppage.component';
import { AppComponent } from './app.component';
import { ProfileComponent } from '../components/profile/profile.component';
import { HomeComponent } from '../components/home/home.component';
import { SigninComponent } from '../components/signin/signin.component';
import { ProductDetailsComponent } from '../components/product-details/product-details.component';
import { AdminDashboardComponent } from '../components/admin-dashboard/admin-dashboard.component';
import { ForgotPageComponent } from '../components/forgot-page/forgot-page.component';
import { ResetComponent } from '../components/reset/reset.component';

export const routes: Routes = [
    {
        path : '',
        redirectTo : "home",
        pathMatch : 'full'
    },
    {
        path : 'home',
        component : HomeComponent
    },
    {
        path : 'products',
        component : ProductsComponent
    },
    {
        path : 'admin',
        component : AdminDashboardComponent
    },
    {
        path : 'help',
        component : HelppageComponent
    },
    {
        path : 'signin',
        component : SigninComponent
    },
    {
        path : 'signup',
        component : SignupComponent
    },
    {
        path : 'profile',
        component : ProfileComponent
    },
    {
        path : 'product-details/:id',
        component : ProductDetailsComponent
    },
    {
        path : 'forgot-page',
        component : ForgotPageComponent
    },
    {
        path : 'reset-page',
        component : ResetComponent
    }
];
