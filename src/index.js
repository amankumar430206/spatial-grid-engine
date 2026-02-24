import ReactDOM from 'react-dom'
import html2canvas from 'html2canvas'

import DashboardLayout from './DashboardLayout'
import AppLayout from './AppLayout'

import React, {useRef, useState, useEffect} from 'react'

import {TransformWrapper, TransformComponent} from 'react-zoom-pan-pinch'
const FLOOR_WIDTH = 2600
const FLOOR_HEIGHT = 1800

const COLS = 10
const ROWS = 10
const ROOM_WIDTH = 180
const ROOM_HEIGHT = 120
const GAP = 40

const STATUSES = ['available', 'occupied', 'maintenance', 'cleaning']

const STATUS_COLORS = {
  available: 'bg-green-400',
  occupied: 'bg-red-400',
  maintenance: 'bg-yellow-400',
  cleaning: 'bg-blue-400',
}

export default function FloorDashboard() {
  const transformRef = useRef(null)
  const floorRef = useRef(null)
  const [transformState, setTransformState] = useState({
    scale: 1,
    positionX: 0,
    positionY: 0,
  })

  const generateRooms = () =>
    Array.from({length: COLS * ROWS}, (_, i) => {
      const col = i % COLS
      const row = Math.floor(i / COLS)

      return {
        id: i + 1,
        x: col * (ROOM_WIDTH + GAP) + 100,
        y: row * (ROOM_HEIGHT + GAP) + 100,
        status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      }
    })

  // Generate grid-based rooms
  const [rooms, setRooms] = useState(generateRooms)
  const [activeFloor, setActiveFloor] = useState(1)
  const [filter, setFilter] = useState('all')
  const [selectedRoom, setSelectedRoom] = useState(null)

  const filteredRooms =
    filter === 'all' ? rooms : rooms.filter((r) => r.status === filter)

  const zoomToRoom = (room) => {
    const scale = 2

    const targetX = -room.x * scale + window.innerWidth / 2 - ROOM_WIDTH
    const targetY = -room.y * scale + window.innerHeight / 2 - ROOM_HEIGHT

    transformRef.current.setTransform(
      targetX,
      targetY,
      scale,
      400,
      'easeOutCubic',
    )
  }

  const fitToScreen = () => {
    transformRef.current.resetTransform(400)
  }

  const exportSnapshot = async () => {
    if (!floorRef.current) return

    const canvas = await html2canvas(floorRef.current, {
      backgroundColor: '#ffffff',
      scale: 2, // higher quality
    })

    const link = document.createElement('a')
    link.download = `floor-${activeFloor}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  useEffect(() => {
    const handler = () => fitToScreen()
    window.addEventListener('fit-floor', handler)
    return () => window.removeEventListener('fit-floor', handler)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      const roomId = e.detail
      const room = rooms.find((r) => r.id === roomId)
      if (room) {
        zoomToRoom(room)
      }
    }

    window.addEventListener('room-search', handler)
    return () => window.removeEventListener('room-search', handler)
  }, [rooms])

  // live room status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRooms((prev) =>
        prev.map((room) => ({
          ...room,
          status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
        })),
      )
    }, 9000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-full relative overflow-hidden bg-gray-50">
      <FloorSwitcher
        floors={[1, 2, 3]}
        activeFloor={activeFloor}
        setActiveFloor={setActiveFloor}
      />

      {/* search bar */}
      <header className="h-16 bg-white shadow flex items-center justify-between px-6 mb-3">
        <h1 className="text-xl font-semibold">Floor Dashboard</h1>

        <div className="flex gap-3">
          <StatusFilter filter={filter} setFilter={setFilter} />
          <input
            type="number"
            placeholder="Search room..."
            className="border px-3 py-1 rounded w-40 border-gray-300 focus:ring-2 focus:ring-blue-400 outline-0"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                window.dispatchEvent(
                  new CustomEvent('room-search', {
                    detail: Number(e.target.value),
                  }),
                )
              }
            }}
          />

          <button
            onClick={() => window.dispatchEvent(new Event('fit-floor'))}
            className="px-3 py-1 bg-black text-white rounded"
          >
            Reset Layout
          </button>
          <button
            onClick={exportSnapshot}
            className="px-3 py-1 bg-black text-white rounded"
          >
            Export Layout
          </button>
        </div>
      </header>

      <div className="mb-4">
        <OccupancyStats rooms={rooms} />
      </div>

      <StatusLegend />

      {/* board */}
      <TransformWrapper
        ref={transformRef}
        minScale={0.5}
        maxScale={4}
        onTransformed={(_, state) => setTransformState(state)}
      >
        <TransformComponent>
          <div
            ref={floorRef}
            className="relative bg-white border border-gray-100"
            style={{
              width: FLOOR_WIDTH,
              height: FLOOR_HEIGHT,
            }}
          >
            {/* "room" can also be used, filteredRooms is used to show as per available rooms  */}
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => {
                  zoomToRoom(room)
                  setSelectedRoom(room)
                }}
                className="absolute cursor-pointer border text-white font-semibold flex items-center justify-center hover:scale-105 transition-all duration-500"
                style={{
                  width: ROOM_WIDTH,
                  height: ROOM_HEIGHT,
                  left: room.x,
                  top: room.y,
                  backgroundColor:
                    room.status === 'available'
                      ? '#22c55e'
                      : room.status === 'occupied'
                      ? '#ef4444'
                      : room.status === 'maintenance'
                      ? '#facc15'
                      : '#3b82f6',
                }}
              >
                <div className="flex flex-col gap-3 capitalize">
                  <span> Room {room.id}</span>
                  <span>{room.status}</span>
                </div>
              </div>
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>

      <RoomDetailModal
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
      />

      {/* mini map */}
      <MiniMap
        transformState={transformState}
        floorWidth={FLOOR_WIDTH}
        floorHeight={FLOOR_HEIGHT}
        transformRef={transformRef}
        rooms={rooms}
        roomWidth={ROOM_WIDTH}
        roomHeight={ROOM_HEIGHT}
      />
    </div>
  )
}

function MiniMap({
  transformState,
  floorWidth,
  floorHeight,
  transformRef,
  rooms,
  roomWidth,
  roomHeight,
}) {
  const miniWidth = 260
  const miniHeight = 180

  const scaleX = miniWidth / floorWidth
  const scaleY = miniHeight / floorHeight

  const [dragging, setDragging] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const viewWidth = window.innerWidth / transformState.scale
  const viewHeight = window.innerHeight / transformState.scale

  const viewX = -transformState.positionX / transformState.scale
  const viewY = -transformState.positionY / transformState.scale

  const moveCamera = (realX, realY) => {
    const scale = transformState.scale

    const targetX = -realX * scale + window.innerWidth / 2
    const targetY = -realY * scale + window.innerHeight / 2

    transformRef.current.setTransform(
      targetX,
      targetY,
      scale,
      0,
      'easeOutCubic',
    )
  }

  const handleMiniMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    moveCamera(clickX / scaleX, clickY / scaleY)
  }

  const handleMouseMove = (e) => {
    if (!dragging) return

    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    moveCamera(mouseX / scaleX, mouseY / scaleY)
  }

  return (
    <div className="absolute bottom-4 right-4 bg-white border border-gray-300 shadow-lg p-2 rounded z-50">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full bg-black text-white text-xs py-1 px-2 rounded"
      >
        {collapsed ? 'Expand Map' : 'Hide Map'}
      </button>

      {!collapsed && (
        <div className="bg-white border border-gray-100 shadow-lg p-2 rounded mt-2">
          {/* minimap content */}
          <div
            className="relative bg-gray-100 cursor-pointer overflow-hidden"
            style={{width: miniWidth, height: miniHeight}}
            onClick={handleMiniMapClick}
            onMouseMove={handleMouseMove}
            onMouseUp={() => setDragging(false)}
            onMouseLeave={() => setDragging(false)}
          >
            {/* Rooms */}
            {rooms.map((room) => (
              <div
                key={room.id}
                className="absolute bg-gray-400"
                style={{
                  width: roomWidth * scaleX,
                  height: roomHeight * scaleY,
                  left: room.x * scaleX,
                  top: room.y * scaleY,
                }}
              />
            ))}

            {/* Draggable Viewport */}
            <div
              onMouseDown={() => setDragging(true)}
              className="absolute border-2 border-blue-400 bg-black/20 cursor-grab shadow"
              style={{
                width: viewWidth * scaleX,
                height: viewHeight * scaleY,
                left: viewX * scaleX,
                top: viewY * scaleY,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function RoomDetailModal({room, onClose}) {
  if (!room) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-xl font-bold mb-4">Room {room.id}</h2>

        <p>Status: {room.status}</p>
        <p>
          Position: {room.x}, {room.y}
        </p>

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-black text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export function StatusFilter({filter, setFilter}) {
  const statuses = ['all', 'available', 'occupied', 'maintenance', 'cleaning']

  return (
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="border px-3 py-1 rounded"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s.toUpperCase()}
        </option>
      ))}
    </select>
  )
}

export function FloorSwitcher({floors, activeFloor, setActiveFloor}) {
  return (
    <div className="flex gap-2 mb-4">
      {floors.map((floor) => (
        <button
          key={floor}
          onClick={() => setActiveFloor(floor)}
          className={`px-3 py-1 rounded ${
            activeFloor === floor ? 'bg-black text-white' : 'bg-gray-200'
          }`}
        >
          Floor {floor}
        </button>
      ))}
    </div>
  )
}

export function StatusLegend() {
  const legend = [
    {label: 'Available', color: '#22c55e'},
    {label: 'Occupied', color: '#ef4444'},
    {label: 'Maintenance', color: '#facc15'},
    {label: 'Cleaning', color: '#3b82f6'},
  ]

  return (
    <div className="flex justify-between bg-white rounded p-3 shadow-md">
      <h3 className="text-sm font-semibold">Status</h3>

      <div className="flex gap-3 justify-end">
        {legend.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded"
              style={{backgroundColor: item.color}}
            />
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function OccupancyStats({rooms}) {
  const total = rooms.length
  const available = rooms.filter((r) => r.status === 'available').length
  const occupied = rooms.filter((r) => r.status === 'occupied').length
  const maintenance = rooms.filter((r) => r.status === 'maintenance').length

  const occupancyRate = ((occupied / total) * 100).toFixed(1)

  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <StatCard title="Total Rooms" value={total} />
      <StatCard title="Available" value={available} color="bg-green-500" />
      <StatCard title="Occupied" value={occupied} color="bg-red-500" />
      <StatCard title="Occupancy %" value={`${occupancyRate}%`} />
    </div>
  )
}

function StatCard({title, value, color = 'bg-gray-800'}) {
  return (
    <div className={`p-4 rounded text-white ${color}`}>
      <div className="text-sm opacity-80">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function App() {
  return (
    <>
      <AppLayout>
        <FloorDashboard />
      </AppLayout>
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
