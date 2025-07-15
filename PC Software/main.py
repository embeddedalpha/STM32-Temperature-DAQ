import sys
import csv
import threading
from collections import defaultdict
from datetime import datetime
from PyQt5 import QtWidgets, QtCore
from PyQt5.QtWidgets import (
    QMainWindow, QWidget, QLabel, QPushButton,
    QListWidget, QTableWidget, QTableWidgetItem,
    QFileDialog, QHBoxLayout, QVBoxLayout
)
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure
import serial
import serial.tools.list_ports

class SerialReader(QtCore.QObject):
    data_received = QtCore.pyqtSignal(str)

    def __init__(self, ser):
        super().__init__()
        self.ser = ser
        self._running = True

    def start(self):
        threading.Thread(target=self.read_loop, daemon=True).start()

    def stop(self):
        self._running = False

    def read_loop(self):
        while self._running:
            if self.ser.in_waiting:
                try:
                    line = self.ser.readline().decode(errors='ignore').strip()
                    self.data_received.emit(line)
                except Exception:
                    pass

class DataLoggerWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Python Data Logger")
        self.resize(1000, 700)

        self.serial = None
        self.reader = None
        self.paused = False
        self.data_buffers = defaultdict(list)
        self.channels = [0]

        # Section A: Serial controls
        port_label = QLabel("Serial Port:")
        self.port_combo = QtWidgets.QComboBox()
        self.refresh_ports()
        baud_label = QLabel("Baud Rate:")
        self.baud_combo = QtWidgets.QComboBox()
        self.baud_combo.addItems([str(b) for b in [9600, 19200, 38400, 57600,
                                                   115200, 230400, 460800, 921600]])
        self.connect_btn = QPushButton("Connect")
        self.connect_btn.clicked.connect(self.toggle_connection)

        # Section B: Control buttons
        self.pause_btn = QPushButton("Pause")
        self.pause_btn.clicked.connect(self.pause)
        self.pause_btn.setEnabled(False)
        self.resume_btn = QPushButton("Resume")
        self.resume_btn.clicked.connect(self.resume)
        self.resume_btn.setEnabled(False)
        self.export_btn = QPushButton("Export CSV")
        self.export_btn.clicked.connect(self.export_data)
        self.export_btn.setEnabled(False)

        # Section C: Channel panel
        ch_label = QLabel("Channels:")
        self.channel_list = QListWidget()
        self.channel_list.addItem("Channel 0")
        self.channel_list.setCurrentRow(0)
        self.channel_list.currentRowChanged.connect(self.update_plot)
        self.add_ch_btn = QPushButton("+")
        self.add_ch_btn.clicked.connect(self.add_channel)

        # Section E: Data table
        self.table = QTableWidget()
        self.table.setColumnCount(4)
        self.table.setHorizontalHeaderLabels(["Channel", "Time", "Temp °C", "Temp °F"])

        # Section D: Chart
        self.figure = Figure()
        self.canvas = FigureCanvas(self.figure)
        self.ax = self.figure.add_subplot(111)

        # Layout A
        secA = QHBoxLayout()
        secA.addWidget(port_label)
        secA.addWidget(self.port_combo)
        secA.addWidget(baud_label)
        secA.addWidget(self.baud_combo)
        secA.addWidget(self.connect_btn)

        # Layout B
        secB = QHBoxLayout()
        secB.addWidget(self.pause_btn)
        secB.addWidget(self.resume_btn)
        secB.addWidget(self.export_btn)

        # Top layout (A and B proportional)
        top_layout = QHBoxLayout()
        top_layout.addLayout(secA, 1)
        top_layout.addLayout(secB, 1)

        # Channel panel (C + E with proportions)
        ch_ctrl = QHBoxLayout()
        ch_ctrl.addWidget(ch_label)
        ch_ctrl.addWidget(self.add_ch_btn)
        ch_panel = QVBoxLayout()
        ch_panel.addLayout(ch_ctrl)
        ch_panel.addWidget(self.channel_list, 1)
        ch_panel.addWidget(self.table, 3)

        # Middle layout (left: channel panel, right: chart proportional)
        middle_layout = QHBoxLayout()
        middle_layout.addLayout(ch_panel, 1)
        middle_layout.addWidget(self.canvas, 4)

        # Main layout (top and middle proportional)
        main_widget = QWidget()
        main_layout = QVBoxLayout(main_widget)
        main_layout.addLayout(top_layout, 1)
        main_layout.addLayout(middle_layout, 5)

        self.setCentralWidget(main_widget)

    def refresh_ports(self):
        self.port_combo.clear()
        for p in serial.tools.list_ports.comports():
            self.port_combo.addItem(p.device)

    def toggle_connection(self):
        if self.serial and self.serial.is_open:
            self.disconnect()
        else:
            self.connect()

    def connect(self):
        port = self.port_combo.currentText()
        baud = int(self.baud_combo.currentText())
        try:
            self.serial = serial.Serial(port, baud, timeout=1)
            self.reader = SerialReader(self.serial)
            self.reader.data_received.connect(self.handle_data)
            self.reader.start()
            self.connect_btn.setText("Disconnect")
            self.pause_btn.setEnabled(True)
            self.export_btn.setEnabled(True)
        except Exception as e:
            QtWidgets.QMessageBox.critical(self, "Error", str(e))

    def disconnect(self):
        if self.reader:
            self.reader.stop()
        if self.serial and self.serial.is_open:
            self.serial.close()
        self.connect_btn.setText("Connect")
        self.pause_btn.setEnabled(False)
        self.resume_btn.setEnabled(False)

    def pause(self):
        self.paused = True
        self.pause_btn.setEnabled(False)
        self.resume_btn.setEnabled(True)

    def resume(self):
        self.paused = False
        self.pause_btn.setEnabled(True)
        self.resume_btn.setEnabled(False)

    def handle_data(self, line):
        if self.paused:
            return
        parts = line.split(',')
        timestamp = datetime.now().strftime("%H:%M:%S")
        for idx, val in enumerate(parts):
            try:
                num = float(val)
                self.data_buffers[idx].append(num)
                # populate table E
                row = self.table.rowCount()
                self.table.insertRow(row)
                self.table.setItem(row, 0, QTableWidgetItem(str(idx)))
                self.table.setItem(row, 1, QTableWidgetItem(timestamp))
                self.table.setItem(row, 2, QTableWidgetItem(f"{num:.2f}"))
                f_val = num * 9/5 + 32
                self.table.setItem(row, 3, QTableWidgetItem(f"{f_val:.2f}"))
            except ValueError:
                pass
        self.update_plot()

    def update_plot(self):
        ch = self.channel_list.currentRow()
        data = self.data_buffers.get(ch, [])
        self.ax.clear()
        self.ax.plot(data)
        self.ax.set_title(f"Channel {ch}")
        self.canvas.draw()

    def add_channel(self):
        new_idx = len(self.channels)
        self.channels.append(new_idx)
        self.channel_list.addItem(f"Channel {new_idx}")
        self.channel_list.setCurrentRow(new_idx)

    def export_data(self):
        path, _ = QFileDialog.getSaveFileName(self, "Save CSV", filter="CSV Files (*.csv)")
        if path:
            with open(path, 'w', newline='') as csvfile:
                writer = csv.writer(csvfile)
                headers = [self.table.horizontalHeaderItem(i).text() for i in range(self.table.columnCount())]
                writer.writerow(headers)
                for r in range(self.table.rowCount()):
                    row_data = [self.table.item(r, c).text() for c in range(self.table.columnCount())]
                    writer.writerow(row_data)

if __name__ == '__main__':
    app = QtWidgets.QApplication(sys.argv)
    window = DataLoggerWindow()
    window.show()
    sys.exit(app.exec_())
