##### PROJECT SETTINGS #####
JAVA := java
JAVAC := javac

PROGRAM_NAME := Tutorial6
MAIN_CLASS := DisplayColors
MAIN_PACKAGE := observer3

SRC_DIR := ./src
BIN_DIR := ./bin
INC_DIR := ./inc
LIB_DIR := ./lib

EXTERNAL_LIBRARIES :=

JAVA_FLAGS := -Xdiags:verbose
##### PROJECT SETTINGS #####


LIBRARIES := $(wildcard $(LIB_DIR)/*.jar)
ifneq ($(EXTERNAL_LIBRARIES),)
	LIBRARIES += $(EXTERNAL_LIBRARIES)
endif
null :=
semicolon := :
space := $(null) #
LIBRARIES := $(LIBRARIES)
LIBRARIES := $(subst $(space),$(semicolon),$(strip $(LIBRARIES)))

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
	@$(JAVA) -cp $(BIN_DIR) $(MAIN_PACKAGE).$(MAIN_CLASS)
