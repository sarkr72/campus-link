After cloning the projrct:

install laragon software:

In lagagon: 
1. go to database
2. bottom left corner: press "new"
3. network type: mariadb or mysql (tcp/ip) its default
4. hostname/ Ip: get rds endpoint
5. user: 
6. password: 
7. databases:



in project directory: 
1. npm install
2. npm install @prisma/client prisma
3. npm install prisma --save-dev
4. npx prisma init --datasource-provider mysql

5. in the .env file: 
DATABASE_URL=""

6. npx prisma generate
7. start working on the project.

(if you want to create table, go to prisma->prisma file)

8. if you create new table or add new column then run these: 

npx prisma migrate dev --name migrate_name

npx prisma migrate deploy

npx prisma generate

9. npm install react-bootstrap


This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.
