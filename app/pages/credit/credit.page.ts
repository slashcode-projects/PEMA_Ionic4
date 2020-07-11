import { DatabaseService, CreditData } from './../../services/database.service';
import { Component, OnInit } from '@angular/core';
import { ToastController} from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-credit',
  templateUrl: './credit.page.html',
  styleUrls: ['./credit.page.scss'],
})
export class CreditPage implements OnInit {
  creditsData: CreditData[] = [];

  creditTrans: Observable<any[]>;

  indCreditData = {};
  indCreditTrans = {};

  selectedView = 'creditDetails';

  constructor(private db: DatabaseService, private toast: ToastController) { }

  ngOnInit() {
    this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {
        this.db.getCreditData().subscribe(cd => {
          this.creditsData = cd;
        });
        this.creditTrans = this.db.getCreditTransactions();
      }
    });
  }

  addCardDetails() {
    this.db.addCreditDetail(this.indCreditData['cardName'], this.indCreditData['bankName'], 0, this.indCreditData['cardLimit'], this.indCreditData['cardLimit']).then(_ => {
      this.indCreditData = {};
    }).then(async (res) => {
      let toast = await this.toast.create({
        message: 'Card added successfully.',
        duration: 3000
      });
      toast.present();
    });
  }
  addCreditTrans() {
    this.db.getExpensedAndLeftMoney(this.indCreditTrans['cardId']);
    this.db.addCreditTransactions(this.indCreditTrans['transactionDetails'], this.indCreditTrans['dateOfTransaction'], this.indCreditTrans['amount'], this.indCreditTrans['cardId']).then(_ => {
      this.indCreditTrans = {};
    }).then(async (res) => {
      let toast = await this.toast.create({
        message: 'Transaction details added successfully.',
        duration: 3000
      });
      toast.present();
    });
  }
}
