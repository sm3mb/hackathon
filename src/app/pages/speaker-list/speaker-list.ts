import { Component } from '@angular/core';
import { ConferenceData } from '../../providers/conference-data';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { FormGroup, FormControl } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';

import { FilePath } from '@ionic-native/file-path/ngx';
import { FileTransfer, FileUploadOptions } from '@ionic-native/file-transfer/ngx';
import { toBase64String } from '@angular/compiler/src/output/source_map';

@Component({
  selector: 'page-speaker-list',
  templateUrl: 'speaker-list.html',
  styleUrls: ['./speaker-list.scss'],
})
export class SpeakerListPage {
  speakers: any[] = [];
  submitted = false;

  images : any = [];

  photos: any = [];

  processing:boolean;
  uploadImage: any;
  ownername: any;
  registrationForm: FormGroup;
  constructor(public confData: ConferenceData,private formBuilder: FormBuilder, public file: File, public imagepicker: ImagePicker) {
    
  }
  get f() { return this.registrationForm.controls; }

  // TakePhotos(){
  //   let options:CameraOptions={
  //     quality:100,
  //     encodingType : this.camera.EncodingType.JPEG,
  //     destinationType: this.camera.DestinationType.FILE_URI,
  //     mediaType : this.camera.MediaType.PICTURE
  //   }
  //   this.camera.getPicture(options).then((imageUri) => {
  //     this.filepath.resolveNativePath(imageUri).then((nativePath)=>{
  //       this.photos.push(nativePath);
  //     })
  //   })
  // }

  ngOnInit() {
    this.registrationForm = this.formBuilder.group({
      ownername: ['', Validators.required],
      vehicletype: ['', [Validators.required]],
      milesdriven:['', [Validators.required]],
      carcolor:['', [Validators.required]],
      mileagecity:['', [Validators.required]],
      mileagehighway:['', [Validators.required]],
      fueltype:['',[Validators.required]],
      carcondition:['',[Validators.required]]
    });
  }
  ionViewDidEnter() {
    this.confData.getSpeakers().subscribe((speakers: any[]) => {
      this.speakers = speakers;
    });
  }

  // pickMultipleImages() {
  //   var options: ImagePickerOptions = {
  //     maximumImagesCount: 5,
  //     width: 100,
  //     height: 100
  //   }
  //   this.imagepicker.getPictures(options).then((results) => {
  //     for (var interval = 0; interval < results.length; interval++) {
  //       let filename = results[interval].substring(results[interval]
  //         .lastIndexOf('/') + 1);
  //         let path = results[interval].substring(0,results[interval].lastIndexOf('/')+1)
  //         this.file.readAsDataURL(path,filename).then((base64String)=>{
  //           this.images.push(base64String);
  //         })
  //     }
  //   });
  // }

  onSubmit() {
    console.log(this.registrationForm.value);
  }

  presentActionSheet(fileLoader) {
    fileLoader.click();
    var that = this;
    fileLoader.onchange = function () {
      var file = fileLoader.files[0];
      var reader = new FileReader();

      reader.addEventListener("load", function () {
        that.processing = true;
        that.getOrientation(fileLoader.files[0], function (orientation) {
          if (orientation > 1) {
            that.resetOrientation(reader.result, orientation, function (resetBase64Image) {
              that.uploadImage = resetBase64Image;
            });
          } else {
            that.uploadImage = reader.result;
          }
        });
      }, false);

      if (file) {
        reader.readAsDataURL(file);
      }
    }
  }
imageLoaded(){
  this.processing = false;
}
getOrientation(file, callback) {
  var reader = new FileReader();
  reader.onload = function (e:any) {

    var view = new DataView(e.target.result);
    if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
    var length = view.byteLength, offset = 2;
    while (offset < length) {
      var marker = view.getUint16(offset, false);
      offset += 2;
      if (marker == 0xFFE1) {
        if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
        var little = view.getUint16(offset += 6, false) == 0x4949;
        offset += view.getUint32(offset + 4, little);
        var tags = view.getUint16(offset, little);
        offset += 2;
        for (var i = 0; i < tags; i++)
          if (view.getUint16(offset + (i * 12), little) == 0x0112)
            return callback(view.getUint16(offset + (i * 12) + 8, little));
      }
      else if ((marker & 0xFF00) != 0xFF00) break;
      else offset += view.getUint16(offset, false);
    }
    return callback(-1);
  };
  reader.readAsArrayBuffer(file);
}
resetOrientation(srcBase64, srcOrientation, callback) {
  var img = new Image();

  img.onload = function () {
    var width = img.width,
      height = img.height,
      canvas = document.createElement('canvas'),
      ctx = canvas.getContext("2d");

    // set proper canvas dimensions before transform & export
    if (4 < srcOrientation && srcOrientation < 9) {
      canvas.width = height;
      canvas.height = width;
    } else {
      canvas.width = width;
      canvas.height = height;
    }

    // transform context before drawing image
    switch (srcOrientation) {
      case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
      case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
      case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
      case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
      case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
      case 7: ctx.transform(0, -1, -1, 0, height, width); break;
      case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
      default: break;
    }

    // draw image
    ctx.drawImage(img, 0, 0);

    // export base64
    callback(canvas.toDataURL());
  };

  img.src = srcBase64;
}
removePic() {
  this.uploadImage = null;
}

}
