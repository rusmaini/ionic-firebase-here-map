
//import { ToastController } from 'ionic-angular';
import { Injectable, NgZone } from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import { Profile } from '../../models/profile';

//insert location
import { Lokasi } from '../../models/lokasi';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';


@Injectable()
export class LocationTrackerProvider {

  lokasi = {} as Lokasi;

  public watch: any;   
  public lat: number = 0;
  public lng: number = 0;

  map: any;
  myloc: any;
  mkr: any = [];

  dataLokasi: any; //Observable<any>

  profile = {} as Profile;
  profileData: Observable<any>

  constructor(
    private fireAuth: AngularFireAuth, 
    private fireDatabase: AngularFireDatabase,  
    //private toast: ToastController,
    public zone: NgZone, 
    public backgroundGeolocation: BackgroundGeolocation, 
    public geolocation: Geolocation) {
  }
 
  startTracking(map) {
 
    // Background Tracking
   
    let config = {
      desiredAccuracy: 0,
      stationaryRadius: 20,
      distanceFilter: 10,
      debug: true,
      interval: 2000
    };
   
    this.backgroundGeolocation.configure(config).subscribe((location) => {
   
      console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);
   
      // Run update inside of Angular's zone
      this.zone.run(() => {
        this.lat = location.latitude;
        this.lng = location.longitude;
      });
   
    }, (err) => {
   
      console.log(err);
   
    });
   
    // Turn ON the background-geolocation system.
    this.backgroundGeolocation.start();
   
   
    // Foreground Tracking
    let options = {
      frequency: 3000,
      enableHighAccuracy: true
    };
    
    this.watch = this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {
    
      console.log(position);
    
      // Run update inside of Angular's zone
      this.zone.run(() => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });

      //centerkan map
      map.setCenter({lat:position.coords.latitude, lng:position.coords.longitude});
      
      //let getLokasi= [];
      this.dataLokasi = this.fireDatabase.object('lokasi/').valueChanges();
      this.dataLokasi.subscribe(lok => {
        for(let k in lok){
          if (!this.mkr[k]) {
            //papar marker
            this.mkr[k] = new H.map.Marker({lat:lok[k].latitude, lng:lok[k].longitude});
            map.addObject(this.mkr[k]);
          } else {
            this.mkr[k].setPosition({lat:lok[k].latitude, lng:lok[k].longitude});
          }
        }
      });

      /*
      if (!this.myloc) {
        //papar marker
        this.myloc = new H.map.Marker({lat:position.coords.latitude, lng:position.coords.longitude});
        map.addObject(this.myloc);
      } else {
        this.myloc.setPosition({lat:position.coords.latitude, lng:position.coords.longitude});
      }

      this.profileData = this.fireDatabase.object('profile/'+data.uid).valueChanges();
        this.profileData.subscribe(p => {
          if(p){
            this.profile.username   = p.username;
            this.profile.firstName  = p.firstName;
            this.profile.lastName   = p.lastName;
            this.profile.telephone  = p.telephone;
          }
        });
      */

      //simpan lokasi ke firebase
      this.fireAuth.authState.take(1).subscribe(auth => {
        this.profileData = this.fireDatabase.object('profile/'+auth.uid).valueChanges();
        this.profileData.subscribe(p => {
          if(p){
            this.profile.username = p.username;
            this.fireDatabase.object('lokasi/'+auth.uid).set({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              username: this.profile.username
            });
          } 
        });
      })
      
    });
   
  }
 
  stopTracking() {
 
    console.log('stopTracking');
   
    this.backgroundGeolocation.finish();
    this.watch.unsubscribe();
   
  }
  

}
