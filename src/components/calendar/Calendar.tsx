import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  format,
  addDays,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
  Calendar as CalendarIcon,
} from "lucide-react";
import type { Event } from "@/types";

interface CalendarProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  onDateClick: (date: Date) => void;
  onEventDragEnd: (result: unknown) => void;
}

export function Calendar({
  events,
  onEventClick,
  onDateClick,
  onEventDragEnd,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");

  const handlePrevious = () => {
    setCurrentDate((prev) => {
      if (view === "month") {
        return new Date(prev.getFullYear(), prev.getMonth() - 1);
      }
      return addDays(prev, -7);
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      if (view === "month") {
        return new Date(prev.getFullYear(), prev.getMonth() + 1);
      }
      return addDays(prev, 7);
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInView = () => {
    if (view === "month") {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const firstDay = startOfWeek(start);
      return eachDayOfInterval({ start: firstDay, end });
    }

    const start = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) =>
      isSameDay(parseISO(event.start.toString()), date)
    );
  };

  const renderEventCard = (event: Event, index: number) => (
    <Draggable key={event.id} draggableId={event.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEventClick(event)}
          className={`p-2 mb-1 rounded-lg text-sm cursor-pointer transition-all ${
            event.status === "confirmed"
              ? "bg-green-100 hover:bg-green-200"
              : event.status === "pending"
                ? "bg-yellow-100 hover:bg-yellow-200"
                : event.status === "cancelled"
                  ? "bg-red-100 hover:bg-red-200"
                  : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <div className="font-medium mb-1 truncate">{event.title}</div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            <span>{format(new Date(event.start), "HH:mm")}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
            <User className="w-3 h-3" />
            <span className="truncate">{event.client}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex rounded-lg overflow-hidden border">
            <button
              onClick={() => setView("month")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                view === "month"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                view === "week"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Semana
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Hoje
          </button>

          <button
            onClick={() => onDateClick(new Date())}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Evento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div
            key={day}
            className="bg-gray-50 p-2 text-sm font-medium text-gray-700 text-center"
          >
            {day}
          </div>
        ))}
      </div>

      <DragDropContext onDragEnd={onEventDragEnd}>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {getDaysInView().map((date, index) => {
            const isToday = isSameDay(date, new Date());
            const isCurrentMonth = isSameMonth(date, currentDate);
            const dayEvents = getEventsForDate(date);

            return (
              <Droppable
                key={date.toISOString()}
                droppableId={date.toISOString()}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    onClick={() => onDateClick(date)}
                    className={`bg-white p-2 min-h-[150px] transition-colors ${
                      !isCurrentMonth ? "bg-gray-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm font-medium rounded-full w-7 h-7 flex items-center justify-center ${
                          isToday
                            ? "bg-indigo-600 text-white"
                            : isCurrentMonth
                              ? "text-gray-900"
                              : "text-gray-400"
                        }`}
                      >
                        {format(date, "d")}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {dayEvents.length} evento
                          {dayEvents.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.map((event, index) =>
                        renderEventCard(event, index)
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
