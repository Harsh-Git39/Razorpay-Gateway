import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const db = new pg.Client(
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
}
);

db.connect();

passport.use(new GoogleStrategy (
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
    },

    async(acessToken, refreshToken, profile, done)=>
    {
         try
         {
           const UserCheck = await db.query("SELECT * FROM users WHERE google_id = $1" , [profile.id]);

           if(UserCheck.rows.length > 0)
           {
              return done(null, UserCheck.rows[0]);
           }
           else
           {
             const newUser = await db.query("INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING *", 
               [profile.id , profile.emails[0].value, profile.displayName]
             );

             return done(null , newUser.rows[0]);
           }
         }
         catch(err)
         {
            return done(err , null);
         }
    }
)
);


passport.serializeUser((user, done) => done(null , user.id));

passport.deserializeUser(async (id, done) =>
{
 try{
   const find = await db.query('SELECT * FROM users WHERE id = $1' , [id]);
   return done(null , find.rows[0]);
 }
 catch(err)
 {
   done(err, null);
 }
});

export {passport, db};