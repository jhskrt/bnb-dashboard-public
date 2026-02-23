'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

interface Event {
  title: string;
  start: Date | string;
  end: Date | string;
}

interface CheckInCalendarProps {
  events: Event[];
}

export default function CheckInCalendar({ events }: CheckInCalendarProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        displayEventTime={false}
        timeZone="Asia/Taipei"
        events={events}
        height="auto" // Adjust height to fit content
        locale="zh-tw" // Set locale to Traditional Chinese
        eventColor="#78B6F8FF"
        eventBorderColor='#5a5e97'
        eventTextColor='#000000'
        eventClassNames={"my-custom-event"}
      />
    </div>
  );
}
