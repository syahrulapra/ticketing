# Ticketing System
> Hono + MongoDB

## Requirements
- [MongoDB](https://www.mongodb.com/) - Database
- [NodeJs](https://nodejs.org/en/) - Server Environment
- [Hono](https://hono.dev/) - Server Framework

## Deployment
Buat folder untuk menyimpan projectnya, lalu clone repository ini(folder harus kosong!)
```
git clone https://github.com/syahrulapra/ticketing.git
```

Pindah ke folder yang telah di download dan install node module
```
cd ticketing
npm install
``` 

## Run Development System
```
npm run dev
```

## Endpoint
- ```/register``` - Untuk membuat users (default role User)
- ```/login``` - Untuk mendapatkan token
- ```/ticket``` - Untuk mendapatkan data ticket atau membuat data ticket baru
- ```/ticketAnswered/:id``` - Untuk mendapatkan data ticket yang sudah terjawab berdasarkan id ticketAnswereds
- ```/ticket/:number``` - Untuk menjawab ticket berdasarkan ticketNumber
- ```/ticket/close/:number``` - Untuk menutup ticket berdasarkan ticketNumber
- ```/ticket/:id``` - Untuk menghapus ticket berdasarkan id tickets

## Create Users Role Admin
Perintah untuk membuat role admin di postman
```
"username": "username"
"email": "email@gmail.com"
"password": "password"
"role": "Admin"
```
