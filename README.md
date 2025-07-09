
---

## Getting Started

### Prerequisites

- **Toolchains**  
  - STM32CubeIDE (or arm-none-eabi-gcc + Make)  
  - CMake ≥ 3.15  
  - Node.js ≥ 18 & npm  
  - Python 3.9+ (for PC software build scripts)  
- **Libraries & SDKs**  
  - STM32CubeF4 (for F407)  
  - STM32CubeL4 (for L431)  

### Hardware

1. Assemble your PCB via JLCPCB (BOM in `Case Design/`).
2. Populate with:
   - STM32F407VGT6 or STM32L431RCT6  
   - 15× K-type / NTC thermistor connectors  
   - USB-C connector (for power & data)  
   - Power management components (3.3 V LDO, decoupling)

### Firmware (STM32)

1. Open `STM32F407VGT6/Project.ioc` in STM32CubeIDE.  
2. Review clock settings: HSE = 8 MHz, PLL→168 MHz sysclk, APB prescalers.  
3. Configure ADC channels, DMA streams, USB-CDC or UART.  
4. Build and generate `.hex` / `.bin`.

### PC Software

1. `cd PC Software/`  
2. `pip install -r requirements.txt`  
3. `python gui.py`  

### Web App

1. `cd Web App/client && npm install && npm run build`  
2. `cd ../server && npm install`  
3. `npm start`  
4. Browse to `http://localhost:3000`

---

## Building & Flashing

```bash
# Example for STM32F407:
cd STM32F407VGT6
make clean all
openocd -f interface/stlink.cfg -f target/stm32f4x.cfg \
        -c "program build/firmware.bin verify reset exit"
