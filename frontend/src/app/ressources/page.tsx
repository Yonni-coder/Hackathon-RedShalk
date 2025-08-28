"use client"

import { ReservationDialog } from "@/components/design/ressources/ReservationDialog";
import { RoomCard } from "@/components/design/ressources/RoomCard";
import { RoomSkeletonGrid } from "@/components/design/ressources/RoomSkeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInfiniteRooms } from "@/hooks/useInfiniteRooms";
import useRoomsStore from "@/stores/roomsStore";
import { ReservationData, Room } from "@/types/room";
import { motion } from "framer-motion";
import { Building2, Filter, MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Page() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  
  const sampleRooms = useRoomsStore((s) => s.rooms)

  // Filter rooms based on search and type
  const filteredRooms = useMemo(() => {
    let filtered = sampleRooms;

    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [searchTerm]);

  // Get unique room types for filter
  const roomTypes = useMemo(() => {
    const types = Array.from(new Set(sampleRooms.map(room => room.type_name)));
    return types;
  }, []);

  const { rooms, loading, hasMore, loadMore } = useInfiniteRooms({
    initialRooms: filteredRooms,
    filterType: selectedTypeFilter,
  });

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef } = useInView({
    threshold: 0.1,
    onChange: (inView) => {
      if (inView && hasMore && !loading) {
        loadMore();
      }
    },
  });

  const handleReserve = (room: Room) => {
    setSelectedRoom(room);
    setIsReservationDialogOpen(true);
  };

  const handleReservationConfirm = (reservationData: ReservationData) => {
    console.log('Reservation confirmed:', {
      room: selectedRoom,
      reservationData,
    });
    // Here you would typically send the reservation data to your backend
    alert(`Réservation confirmée pour ${selectedRoom?.name}!\nDurée: ${reservationData.duration_count} ${reservationData.duration_type}\nPrix: ${reservationData.price}€`);
  };

  const handleCloseReservationDialog = () => {
    setIsReservationDialogOpen(false);
    setSelectedRoom(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Nos Espaces de Travail
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez nos salles équipées et réservez l'espace parfait pour vos besoins professionnels
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 space-y-4"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Rechercher une salle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/70 backdrop-blur-sm border-gray-200 focus:border-blue-300"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <Select value={selectedTypeFilter} onValueChange={setSelectedTypeFilter}>
                <SelectTrigger className="w-48 bg-white/70 backdrop-blur-sm">
                  <SelectValue placeholder="Type de salle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {roomTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 items-center text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>{rooms.length} salles disponibles</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>3 bâtiments</span>
            </div>
            {selectedTypeFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Filter className="w-3 h-3" />
                {selectedTypeFilter}
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Rooms Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onReserve={handleReserve}
            />
          ))}
        </motion.div>

        {/* Loading Skeleton */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            <RoomSkeletonGrid count={3} />
          </motion.div>
        )}

        {/* Load More Trigger */}
        {hasMore && (
          <div ref={loadMoreRef} className="mt-8 text-center">
            <div className="text-gray-500">Chargement de plus de salles...</div>
          </div>
        )}

        {/* No Results */}
        {!loading && rooms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 text-lg mb-4">Aucune salle trouvée</div>
            <p className="text-gray-500">
              Essayez de modifier vos filtres de recherche
            </p>
          </motion.div>
        )}

        {/* Reservation Dialog */}
        <ReservationDialog
          room={selectedRoom}
          isOpen={isReservationDialogOpen}
          onClose={handleCloseReservationDialog}
          onConfirm={handleReservationConfirm}
        />
      </div>
    </div>
  );
}