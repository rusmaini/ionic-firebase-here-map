
//import { ToastController } from 'ionic-angular';
//import { ViewChild, ElementRef } from '@angular/core';
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

  ui: any;
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
 
  startTracking(map,ui) {
 
    // Background Tracking
   /*
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
   */
   
    // Foreground Tracking
    let options = {
      frequency: 3000,
      enableHighAccuracy: true,
      desiredAccuracy: 0,
      stationaryRadius: 20,
      distanceFilter: 10,
      debug: true,
      interval: 2000
    };
    
    this.watch = this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {
    
      console.log(position);
    
      // Run update inside of Angular's zone
      this.zone.run(() => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });

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

      //centerkan map ikut user 
      map.setCenter({lat:position.coords.latitude, lng:position.coords.longitude});
      
      //let getLokasi= [];
      this.dataLokasi = this.fireDatabase.object('lokasi/').valueChanges();
      this.dataLokasi.subscribe(lok => {
        for(let k in lok){
          //add group 
          var group = new H.map.Group();
          map.addObject(group);
          // add 'tap' event listener, that opens info bubble, to the group
          group.addEventListener('tap', function (evt) {
            // event target is the marker itself, group is a parent event target
            // for all objects that it contains
            var bubble =  new H.ui.InfoBubble(evt.target.getPosition(), {
              // read custom data
              content: evt.target.getData()
            });
            // show info bubble
            ui.addBubble(bubble);
          }, false);

          //add marker & label
          if (!this.mkr[k]) {
            //marker guna icon
            var mymarker  = '../../assets/marker/mark_04.png';
            var myIcon = new H.map.Icon(mymarker);
            this.addMarkerToGroup(group, {lat:lok[k].latitude, lng:lok[k].longitude},
              '<div>' + lok[k].username + '</div>', myIcon);
          } else {
            this.mkr[k].setPosition({lat:lok[k].latitude, lng:lok[k].longitude});
          }
        }
      });
    });
  }
 
  addMarkerToGroup(group, coordinate, html, ikon) {
    var marker = new H.map.Marker(coordinate, {icon: ikon});
    // add custom data to the marker
    marker.setData(html);
    group.addObject(marker);
  }

  stopTracking() {
 
    console.log('stopTracking');
   
    this.backgroundGeolocation.finish();
    this.watch.unsubscribe();
   
  }
  

}
