##### PROJECT SETTINGS #####
JAVA := java
JAVAC := javac

PROGRAM_NAME := TransientCronjob
MAIN_CLASS := TransientCronjob
MAIN_PACKAGE :=

SRC_DIR := ./src
BIN_DIR := ./bin
INC_DIR := ./inc
LIB_DIR := ./lib

EXTERNAL_LIBRARIES :=

JAVA_FLAGS :=
##### PROJECT SETTINGS #####


# Determine libraries
LIBRARIES := $(wildcard $(LIB_DIR)/*.jar)
ifneq ($(EXTERNAL_LIBRARIES),)
	LIBRARIES += $(EXTERNAL_LIBRARIES)
endif
null :=
semicolon := :
space := $(null) #
LIBRARIES := $(LIBRARIES)
LIBRARIES := $(subst $(space),$(semicolon),$(strip $(LIBRARIES)))

# Calculate full class/package name of main class
FULL_CLASS_NAME := $(MAIN_CLASS)
ifneq ($(MAIN_PACKAGE),)
	FULL_CLASS_NAME := $(MAIN_PACKAGE).$(MAIN_CLASS)
endif


JAVA_SRCS := $(shell find $(SRC_DIR) -type f -name '*.java')
JAVA_FLAGS += -d $(BIN_DIR) -cp $(LIBRARIES)



all:
	$(JAVAC) $(JAVA_FLAGS) $(JAVA_SRCS)



.PHONY: clean
clean:
	rm -rf $(EXEC) $(BIN_DIR)/*

.PHONY: spotless
spotless: clean
	spotless -r

.PHONY: test
test: all run

.PHONY: run
run: all
	@$(JAVA) -cp $(LIBRARIES):$(BIN_DIR) $(FULL_CLASS_NAME)
