################################################################################
# Automatically-generated file. Do not edit!
# Toolchain: GNU Tools for STM32 (13.3.rel1)
################################################################################

# Add inputs and outputs from these tool invocations to the build variables 
C_SRCS += \
../Drivers/GPIO/GPIO.c 

OBJS += \
./Drivers/GPIO/GPIO.o 

C_DEPS += \
./Drivers/GPIO/GPIO.d 


# Each subdirectory must supply rules for building sources it contributes
Drivers/GPIO/%.o Drivers/GPIO/%.su Drivers/GPIO/%.cyclo: ../Drivers/GPIO/%.c Drivers/GPIO/subdir.mk
	arm-none-eabi-gcc "$<" -mcpu=cortex-m4 -std=gnu11 -DSTM32 -DSTM32F4 -DSTM32F407VGTx -c -I../Inc -I"D:/STM32F407_Projects/Thermistor_DAQ/Drivers" -Os -ffunction-sections -fdata-sections -Wall -fstack-usage -fcyclomatic-complexity -MMD -MP -MF"$(@:%.o=%.d)" -MT"$@" --specs=nano.specs -mfpu=fpv4-sp-d16 -mfloat-abi=hard -mthumb -o "$@"

clean: clean-Drivers-2f-GPIO

clean-Drivers-2f-GPIO:
	-$(RM) ./Drivers/GPIO/GPIO.cyclo ./Drivers/GPIO/GPIO.d ./Drivers/GPIO/GPIO.o ./Drivers/GPIO/GPIO.su

.PHONY: clean-Drivers-2f-GPIO

