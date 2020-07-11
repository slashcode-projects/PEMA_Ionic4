import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { HttpClient } from '@angular/common/http';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CreditData {
  id: number;
  card_name: string;
  bank_name: string;
  expensed: string;
  left_money: string;
  card_limit: string;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private database: SQLiteObject;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  creditsData = new BehaviorSubject([]);
  creditTransactions = new BehaviorSubject([]);
  expensedMoney: any ;
  leftMoney: any ;
  actualLimit: any;
  constructor(private plt: Platform, private sqlitePorter: SQLitePorter, private sqlite: SQLite, private http: HttpClient) {
    this.plt.ready().then(() => {
      this.sqlite.create({
        name: 'Credit.db',
        location: 'default'
      })
      .then((db: SQLiteObject) => {
          this.database = db;
          this.seedDatabase();
      });
    });
  }
  seedDatabase() {
    this.http.get('assets/inputCredit.sql', { responseType: 'text'})
    .subscribe(sql => {
      this.sqlitePorter.importSqlToDb(this.database, sql)
        .then(_ => {
          this.loadCreditDetails();
          this.loadCreditTransaction();
          this.dbReady.next(true);
        })
        .catch(e => console.error(e));
    });
  }
  getDatabaseState() {
    return this.dbReady.asObservable();
  }
  getCreditData(): Observable<CreditData[]> {
    return this.creditsData.asObservable();
  }
  getCreditTransactions(): Observable<any[]> {
    return this.creditTransactions.asObservable();
  }
  loadCreditDetails() {
    return this.database.executeSql('SELECT * FROM Credit_Details', []).then(data => {
      let creditsData: CreditData[] = [];
      console.log('loading data for Credit Card');
      if (data.rows.length > 0) {
        for (let i = 0; i < data.rows.length; i++) {
          creditsData.push({
            id: data.rows.item(i).id,
            card_name: data.rows.item(i).card_name,
            bank_name: data.rows.item(i).bank_name,
            expensed: data.rows.item(i).expensed,
            left_money: data.rows.item(i).left_money,
            card_limit: data.rows.item(i).card_limit
           });
        }
      }
      this.creditsData.next(creditsData);
    });
  }
  loadCreditTransaction() {
    let query = 'SELECT ct.id, ct.transaction_details, ct.date_of_transaction, ct.amount, cd.card_name, cd.bank_name from Credit_Expense_Transaction ct JOIN Credit_Details cd ON ct.card_id=cd.id';
    return this.database.executeSql(query, []).then(data => {
      let creditTransactions = [];
      this.loadCreditDetails();
      if (data.rows.length > 0) {
        for (let i = 0; i < data.rows.length; i++) {
          creditTransactions.push({
            id: data.rows.item(i).id,
            transaction_details: data.rows.item(i).transaction_details,
            date_of_transaction: data.rows.item(i).date_of_transaction,
            amount: data.rows.item(i).amount,
            card_name: data.rows.item(i).bank_name + ' ' + data.rows.item(i).card_name
           });
        }
      }
      this.creditTransactions.next(creditTransactions);
    });
  }
  addCreditDetail(cardName, bankName, expensed, leftMoney, cardLimit) {
    let data = [cardName, bankName, expensed, leftMoney, cardLimit];
    return this.database.executeSql('INSERT INTO Credit_Details (card_name,bank_name,expensed, left_money, card_limit) VALUES (?, ?, ?, ?, ?)', data).then(data => {     
      this.loadCreditDetails();
    });
  }
  addCreditTransactions(transactionDetails, dateOfTransaction, amount, cardId) {
    let data = [transactionDetails, dateOfTransaction, amount, cardId];
    return this.database.executeSql('INSERT INTO Credit_Expense_Transaction (transaction_details, date_of_transaction, amount, card_id) VALUES (?, ?, ?, ?)', data).then(data => {
      this.updateCreditData(amount, cardId);
    });
  }
  updateCreditData(amount, cardId) {
    this.leftMoney = Number.parseInt(this.leftMoney.toString()) - Number.parseInt(amount.toString());
    this.expensedMoney = Number.parseInt(this.expensedMoney.toString()) + Number.parseInt(amount.toString());
    let data = [this.expensedMoney, this.leftMoney];
    return this.database.executeSql(`UPDATE Credit_Details SET expensed = ?, left_money = ? WHERE id = ${cardId}`, data).then(data => {
      this.loadCreditTransaction();
    });
  }
  getExpensedAndLeftMoney(cardId) {
    return this.database.executeSql('SELECT * FROM Credit_Details WHERE id = ?', [cardId]).then(data => {
      this.expensedMoney = data.rows.item(0).expensed;
      this.leftMoney = data.rows.item(0).left_money;
    });
  }

  // Adding logic for reseting limit

  getLimitbyId(id) {
    return this.database.executeSql('SELECT * FROM Credit_Details WHERE id = ?', [id]).then(data => {
      console.log('Data inside select ' + data);
      this.actualLimit = data.rows.item(0).card_limit;
    });
  }

  resetCreditLimit(id) {
    this.actualLimit = Number.parseInt(this.actualLimit.toString());
    let data = [0, this.actualLimit];
    return this.database.executeSql(`UPDATE Credit_Details SET expensed = ?, left_money = ? WHERE id = ${id}`, data).then(data => {
      this.loadCreditTransaction();
    });
  }
}
