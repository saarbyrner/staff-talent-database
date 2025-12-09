import { Routes, Route } from 'react-router-dom'
import LayoutWithMainNav from './components/LayoutWithMainNav'
import SimplePage from './pages/SimplePage'
import Athletes from './pages/Athletes'
import StaffDatabase from './pages/StaffDatabase'
import StaffProfile from './pages/StaffProfile'
import StaffFormEdit from './pages/StaffFormEdit'
import League from './pages/League'
import Screen01_FormsHome from './pages/forms/Screen01_FormsHome'
import Screen02_FormBuilder from './pages/forms/Screen02_FormBuilder'
import Screen02_FormResponses from './pages/forms/Screen02_FormResponses'
import Screen03_FormResponsesForTemplate from './pages/forms/Screen03_FormResponsesForTemplate'
import Screen04_FormAnswerSet from './pages/forms/Screen04_FormAnswerSet'

function App() {
  return (
    <LayoutWithMainNav>
      <Routes>
        {/* Club View Routes */}
        <Route path="/" element={<SimplePage pageName="Home" />} />
        <Route path="/dashboard" element={<SimplePage pageName="Dashboard" />} />
        <Route path="/medical" element={<SimplePage pageName="Medical" />} />
        <Route path="/analysis" element={<SimplePage pageName="Analysis" />} />
        <Route path="/athlete" element={<Athletes />} />
        <Route path="/staff" element={<StaffDatabase />} />
        <Route path="/staff/:id" element={<StaffProfile />} />
        <Route path="/staff/:id/edit" element={<StaffFormEdit />} />
        <Route path="/workloads" element={<SimplePage pageName="Workload" />} />
        <Route path="/questionnaires" element={<Screen01_FormsHome />} />
        <Route path="/forms/form_templates" element={<Screen01_FormsHome />} />
        <Route path="/forms/form_answers_sets" element={<Screen02_FormResponses />} />
        <Route path="/forms/form_answers_sets/forms/:formId" element={<Screen03_FormResponsesForTemplate />} />
        <Route path="/forms/form_answers_sets/:answerSetId" element={<Screen04_FormAnswerSet />} />
        <Route path="/forms/:formId/build" element={<Screen02_FormBuilder />} />
        <Route path="/planning" element={<SimplePage pageName="Calendar" />} />
        <Route path="/activity" element={<SimplePage pageName="Activity log" />} />
        <Route path="/settings" element={<SimplePage pageName="Admin" />} />
        <Route path="/help" element={<SimplePage pageName="Help" />} />

        {/* League View Routes - Same data, different space */}
        <Route path="/league" element={<League />} />
        <Route path="/league/analysis" element={<SimplePage pageName="Analysis" />} />
        <Route path="/league/athlete" element={<Athletes />} />
        <Route path="/league/staff" element={<StaffDatabase />} />
        <Route path="/league/staff/:id" element={<StaffProfile />} />
        <Route path="/league/staff/:id/edit" element={<StaffFormEdit />} />
        <Route path="/league/forms/form_templates" element={<Screen01_FormsHome />} />
        <Route path="/league/forms/form_answers_sets" element={<Screen02_FormResponses />} />
        <Route path="/league/forms/form_answers_sets/forms/:formId" element={<Screen03_FormResponsesForTemplate />} />
        <Route path="/league/forms/form_answers_sets/:answerSetId" element={<Screen04_FormAnswerSet />} />
        <Route path="/league/forms/:formId/build" element={<Screen02_FormBuilder />} />
        <Route path="/league/planning" element={<SimplePage pageName="Calendar" />} />
        <Route path="/league/settings" element={<SimplePage pageName="Admin" />} />
        <Route path="/league/help" element={<SimplePage pageName="Help" />} />
      </Routes>
    </LayoutWithMainNav>
  )
}

export default App