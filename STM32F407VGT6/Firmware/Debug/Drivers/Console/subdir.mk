################################################################################
# Automatically-generated file. Do not edit!
# Toolchain: GNU Tools for STM32 (13.3.rel1)
################################################################################

# Add inputs and outputs from these tool invocations to the build variables 
C_SRCS += \
../Drivers/Console/Console.c 

OBJS += \
./Drivers/Console/Console.o 

C_DEPS += \
./Drivers/Console/Console.d 


# Each subdirectory must supply rules for building sources it contributes
Drivers/Console/%.o Drivers/Console/%.su Drivers/Console/%.cyclo: ../Drivers/Console/%.c Drivers/Console/subdir.mk
	arm-none-eabi-gcc "$<" -mcpu=cortex-m4 -std=gnu11 -g -DDEBUG -DSTM32 -DSTM32F4 -DSTM32F407VGTx -c -I../Inc -I"D:/STM32F407_Projects/Thermistor_DAQ/Drivers" -Og -ffunction-sections -fdata-sections -Wall -fstack-usage -fcyclomatic-complexity -MMD -MP -MF"$(@:%.o=%.d)" -MT"$@" --specs=nano.specs -mfpu=fpv4-sp-d16 -mfloat-abi=hard -mthumb -o "$@"

clean: clean-Drivers-2f-Console

clean-Drivers-2f-Console:
	-$(RM) ./Drivers/Console/Console.cyclo ./Drivers/Console/Console.d ./Drivers/Console/Console.o ./Drivers/Console/Console.su

.PHONY: clean-Drivers-2f-Console

