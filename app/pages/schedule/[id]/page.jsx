// Import necessary dependencies
"use client";
import {
  useRouter,
  useParams,
  useSearchParams,
  usePathname,
} from "next/navigation";

import CalendarPage from '@/app/components/CalendarPage';
import { useEffect } from "react";
import React, { useState } from "react";

const SchedulePage2 = () => {
    const {id} = useParams();
    const email = id.replace("%40", "@");
    return (
      <>
      <CalendarPage id={email}/>
      </>
    );
  }
  
  export default SchedulePage2;