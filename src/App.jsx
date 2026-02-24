import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import MonthlyCalendar from './components/MonthlyCalendar';
import WeeklyCalendar from './components/WeeklyCalendar';
import Settings from './components/Settings';
import InteractiveBackground from './components/InteractiveBackground';

function App() {
  // Initialize events from local storage if available, parsing date strings back into Date objects
  const [events, setEvents] = useState(() => {
    const savedEvents = localStorage.getItem('aethercal_events');
    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        // Revive Date objects
        return parsed.map(evt => ({ ...evt, date: new Date(evt.date) }));
      } catch (e) {
        console.error("Failed to parse local storage events", e);
        return [];
      }
    }
    return [];
  });

  // Initialize theme from local storage if available
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('aethercal_theme');
    return savedTheme || 'dark';
  });

  // Initialize color theme (the aesthetic palette)
  const [colorTheme, setColorTheme] = useState(() => {
    const savedColorTheme = localStorage.getItem('aethercal_color_theme');
    return savedColorTheme || 'default';
  });

  // Save events to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('aethercal_events', JSON.stringify(events));
  }, [events]);

  // Save theme to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('aethercal_theme', theme);
  }, [theme]);

  // Save colorTheme to local storage and apply to DOM
  useEffect(() => {
    localStorage.setItem('aethercal_color_theme', colorTheme);
    document.documentElement.setAttribute('data-theme', colorTheme);
  }, [colorTheme]);

  // Handle global theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Initial load
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <Router>
      <div className="relative flex min-h-screen w-full flex-col">
        {/* The new interactive background layer */}
        <InteractiveBackground theme={theme} />

        {/* Main UI */}
        <div className="relative z-10 flex min-h-screen w-full flex-col">
          <Navigation theme={theme} />
          <Routes>
            <Route path="/" element={<MonthlyCalendar events={events} setEvents={setEvents} />} />
            <Route path="/weekly" element={<WeeklyCalendar events={events} setEvents={setEvents} />} />
            <Route path="/dashboard" element={<Dashboard events={events} setEvents={setEvents} />} />
            <Route path="/settings" element={<Settings theme={theme} setTheme={setTheme} colorTheme={colorTheme} setColorTheme={setColorTheme} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
