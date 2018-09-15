import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { User } from '../../models/user';
import { AngularFireAuth } from 'angularfire2/auth';

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  user = {} as User;

  constructor(private fireAuth: AngularFireAuth, private toast: ToastController, public navCtrl: NavController, public navParams: NavParams) {
  }

  async register(user: User){

    try{
      const info = await this.fireAuth.auth.createUserWithEmailAndPassword(user.email, user.password);
      if(info){
        this.navCtrl.setRoot('LoginPage');
      }
    }
    catch(e){
      //console.error(e);
      this.toast.create({
        message: "All fields are required! Password MUST be at least 6 characters long.",
        duration: 3000,
        cssClass: "error"
      }).present();
    }

  }

}
