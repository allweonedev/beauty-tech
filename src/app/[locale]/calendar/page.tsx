"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Calendar as CalendarIcon, Plus, Clock } from "lucide-react";
import { EventModal } from "@/components/calendar/EventModal";
import type { Event } from "@/types";

export default function CalendarPage() {
  const router = useRouter();
  const [calendarView, setCalendarView] = useState<
    "agenda" | "calendar" | "tasks"
  >("agenda");

  // State for events and modal
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();

  // Mock data for calendar events
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Corte de Cabelo - Maria",
      start: new Date(2024, 2, 15, 10, 0),
      end: new Date(2024, 2, 15, 11, 0),
      client: "Maria Silva",
      service: "Corte de Cabelo",
      status: "confirmed",
    },
  ]);

  // Event handlers
  const handleEventClick = (info: { event: { id: string } }) => {
    const event = events.find((e) => e.id === info.event.id);
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleDateSelect = () => {
    setSelectedEvent(undefined);
    setShowEventModal(true);
  };

  const handleSaveEvent = (eventData: Partial<Event>) => {
    if (selectedEvent) {
      setEvents(
        events.map((event) =>
          event.id === selectedEvent.id ? { ...event, ...eventData } : event
        )
      );
    } else {
      const newEvent = {
        id: Math.random().toString(),
        ...eventData,
        title: eventData.title ?? "Novo Agendamento",
      } as Event;
      setEvents([...events, newEvent]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <h1
              onClick={() => router.push("/")}
              className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
            >
              Beauty Tech
            </h1>
            <span className="mx-2">›</span>
            <h2 className="text-lg font-medium text-gray-700">Calendário</h2>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setCalendarView("agenda")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  calendarView === "agenda"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Agenda
              </button>
              <button
                onClick={() => setCalendarView("calendar")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  calendarView === "calendar"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Calendário
              </button>
              <button
                onClick={() => setCalendarView("tasks")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  calendarView === "tasks"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tarefas
              </button>
            </div>
            <button
              onClick={() => {
                setSelectedEvent(undefined);
                setShowEventModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5" />
              Novo Evento
            </button>
          </div>

          {calendarView === "calendar" && (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={events}
              eventClick={handleEventClick}
              selectable={true}
              select={handleDateSelect}
              locale={ptBR}
            />
          )}

          {calendarView === "agenda" && (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick({ event })}
                  className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-500">{event.client}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : event.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {event.status === "confirmed"
                        ? "Confirmado"
                        : event.status === "pending"
                          ? "Pendente"
                          : "Cancelado"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(event.start, "HH:mm")} -{" "}
                        {format(event.end, "HH:mm")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{format(event.start, "dd/MM/yyyy")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {calendarView === "tasks" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4">A Fazer</h3>
                  {/* Add task list here */}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Em Andamento
                  </h3>
                  {/* Add in-progress tasks here */}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4">Concluído</h3>
                  {/* Add completed tasks here */}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showEventModal && (
        <EventModal
          event={selectedEvent}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(undefined);
          }}
          onSave={handleSaveEvent}
        />
      )}
    </div>
  );
}
