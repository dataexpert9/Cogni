import { UserModel } from '../models/UserModel';

export class LoggedInUser{
    static getLoggedInUser(){
        const objUser = JSON.parse(localStorage.getItem('userobj'));
        return objUser;
    }

    static addLoggedInUser(user){
        localStorage.setItem("userobj",JSON.stringify(user));
    }
    static logoutUser(){
        localStorage.removeItem("userobj");
    }
}