# PEMA_Ionic4
Personal Expense Management Application

CREATE TABLE IF NOT EXISTS Credit_Details(id INTEGER PRIMARY KEY AUTOINCREMENT,card_name TEXT,bank_name TEXT,expensed TEXT, left_money TEXT , card_limit TEXT);
CREATE TABLE IF NOT EXISTS Credit_Expense_Transaction(id INTEGER PRIMARY KEY AUTOINCREMENT,transaction_details TEXT,date_of_transaction TEXT,amount TEXT,card_id INTEGER);
