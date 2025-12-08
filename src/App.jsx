import { Routes, Route } from 'react-router-dom'
import LayoutWithMainNav from './components/LayoutWithMainNav'
import SimplePage from './pages/SimplePage'
import Athletes from './pages/Athletes'
import StaffDatabase from './pages/StaffDatabase'
import Screen01_FormsHome from './pages/forms/Screen01_FormsHome'
import Screen02_FormBuilder from './pages/forms/Screen02_FormBuilder'
import Screen02_FormResponses from './pages/forms/Screen02_FormResponses'
import Screen03_FormResponsesForTemplate from './pages/forms/Screen03_FormResponsesForTemplate'
import Screen04_FormAnswerSet from './pages/forms/Screen04_FormAnswerSet'

function App() {
  return (
    <LayoutWithMainNav>
      <Routes>
        <Route path="/" element={<SimplePage pageName="Home" />} />
        <Route path="/dashboard" element={<SimplePage pageName="Dashboard" />} />
        <Route path="/medical" element={<SimplePage pageName="Medical" />} />
        <Route path="/analysis" element={<SimplePage pageName="Analysis" />} />
        <Route path="/athlete" element={<Athletes />} />
        <Route path="/staff" element={<StaffDatabase />} />
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
      </Routes>
    </LayoutWithMainNav>
  )
}

export default App