"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Authenticator } from "@aws-amplify/ui-react";

export default function Home() {


  return (
    // <div>
    //   <label>home</label>
    //   {/* <Button variant="primary">Primary Button</Button> */}
    //   <p></p>
    //   {<Link href="/pages/logIn">go to login</Link>}
    //   <Link href="/pages/home">go to homepage</Link>
    // </div>
    <Authenticator>
    {({ signOut, user }) => (
      <main>
        <h1>Hello, {user.username}!</h1>
        <button onClick={signOut}>Sign out</button>
      </main>
    )}
  </Authenticator>

  );
}
