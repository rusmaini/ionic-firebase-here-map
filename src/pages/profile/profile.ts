import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Profile } from '../../models/profile';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
//import { HomePage } from '../home/home';
import { Observable } from 'rxjs/Observable';
//import { TabsPage } from '../tabs/tabs';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  profile = {} as Profile;
  profileData: Observable<any>

  constructor(public navCtrl: NavController, 
    private fireAuth: AngularFireAuth, 
    private fireDatabase: AngularFireDatabase, 
    private toast: ToastController,
    public navParams: NavParams) {
  }

  ionViewWillLoad(){
    this.fireAuth.authState.subscribe(data=>{
      if(data && data.email && data.uid){
        this.profileData = this.fireDatabase.object('profile/'+data.uid).valueChanges();
        this.profileData.subscribe(p => {
          if(p){
            this.profile.username   = p.username;
            this.profile.firstName  = p.firstName;
            this.profile.lastName   = p.lastName;
            this.profile.telephone  = p.telephone;
          }
        });
      }
     
      
    });
  }
  
  createProfile(){
    this.fireAuth.authState.take(1).subscribe(auth => {
      const create_profile = this.fireDatabase.object('profile/'+auth.uid).set(this.profile);
      if(create_profile){
        this.toast.create({
          message: "Profile has been updated..",
          duration: 3000,
          cssClass: "success"
        }).present();
      }
    })
  }

  /*
  createProfile(){
    this.fireAuth.authState.take(1).subscribe(auth => {
      this.fireDatabase.object('profile/'+auth.uid).set(this.profile)
      .then(() => this.navCtrl.push(TabsPage));
    })
  }
  */
}
