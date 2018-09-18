import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController ,ToastController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
//import { Profile } from '../../models/profile';
import { Observable } from 'rxjs/Observable';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationTrackerProvider } from '../../providers/location-tracker/location-tracker';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  behavior: any;
  ui: any;
  location: {lat: number, lng: number} = {lat: 3.1390, lng: 101.6869};
  myloc:any;

  profileData: Observable<any>

  constructor(
    private fireAuth: AngularFireAuth, 
    private fireDatabase: AngularFireDatabase,
    public navCtrl: NavController, 
    private toast:ToastController,
    private geolocation: Geolocation,
    public locationTracker: LocationTrackerProvider) {
  }

  start(){
    this.locationTracker.startTracking(this.map,this.ui);
  }
 
  stop(){
    this.locationTracker.stopTracking();
  }

  initHereMap(){

    // Initialize the platform object:
    var platform = new H.service.Platform({
      'app_id': '49MTD7bERe9UAZaKLJOG',
      'app_code': 'cdlBuvn9h2X8LPzTR7xskw',
      //'useHTTPS': true

      });
    var pixelRatio = window.devicePixelRatio || 1;
    var defaultLayers = platform.createDefaultLayers({
      tileSize: pixelRatio === 1 ? 256 : 512,
      ppi: pixelRatio === 1 ? undefined : 320
    });
    

    // Instantiate (and display) a map object:
    this.map = new H.Map(
      document.getElementById('map'),
      defaultLayers.normal.map,
      {
        zoom: 14,
        pixelRatio: pixelRatio,
        center: { lng: this.location.lng, lat: this.location.lat }
      });
      

      //Step 3: make the map interactive
      // MapEvents enables the event system
      // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
      this.behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));

      // Create the default UI components
      this.ui = H.ui.UI.createDefault(this.map, defaultLayers);

  }

  moveToMyLoc(){
    this.geolocation.getCurrentPosition().then((resp) => {
      //Call to your logic HERE
      this.map.setCenter({lat:resp.coords.latitude, lng:resp.coords.longitude});
    }).catch((error) => {
        alert(error);
    });
  }

  ionViewWillLoad(){
    this.fireAuth.authState.subscribe(data=>{
      if(data && data.email && data.uid){
        this.toast.create({
          message: 'Welcome..' + data.email,
          duration: 3000
        }).present();
        this.profileData = this.fireDatabase.object('profile/'+data.uid).valueChanges();
        
        this.initHereMap();
        this.moveToMyLoc();

        console.log(this.profileData);
      }
      else{
        this.signOut();
      }
      
    });
  }
  

  signOut(){
    this.navCtrl.setRoot('LoginPage');
    window.location.reload();
  }

}
