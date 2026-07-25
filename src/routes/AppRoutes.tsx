// src/routes/AppRoutes.tsx

import { Routes, Route } from 'react-router-dom';

import InstituteHomePage from '../pages/InstituteHomePage';

// existing imports stay here...

export default function AppRoutes() {
  return (
    <Routes>

      {/* ==============================
          Institute of Beautiful Success
         ============================== */}

      <Route path="/" element={<InstituteHomePage />} />

      {/* Existing routes below.
         Do NOT remove them. */}

      {/* <Route ... /> */}
      {/* <Route ... /> */}

    </Routes>
  );
}