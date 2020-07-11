import { DatabaseService} from './../services/database.service';
import { Component, OnInit } from '@angular/core';
import { ToastController} from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  creditData: Observable<any[]>;
  transHistory: Observable<any[]>;

  transferData = {};
  constructor(private db: DatabaseService, private toast: ToastController) { }
  ngOnInit() {
    this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {
          this.creditData = this.db.getCreditData();
      }
    });
  }

  resetLimit(id: any) {
    this.db.getLimitbyId(id).then( _ => {
      this.db.resetCreditLimit(id);
    }).then(async (res) => {
      let toast = await this.toast.create({
        message: 'Card details reseted successfully.',
        duration: 3000
      });
      toast.present();
    });
  }
}
