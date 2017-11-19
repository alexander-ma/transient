##### PROJECT SETTINGS #####
JAVA := java
JAVAC := javac

PROGRAM_NAME := transient-cronjob
MAIN_CLASS := TransientCronjob

SRC_DIR := ./src
BIN_DIR := ./bin
INC_DIR := ./inc
LIB_DIR := ./lib

EXTERNAL_LIBRARIES :=

JAVA_FLAGS := -Xlint
##### PROJECT SETTINGS #####




LIBRARIES := $(wildcard $(LIB_DIR)/*.jar)
ifneq ($(EXTERNAL_LIBRARIES),)
	LIBRARIES += $(EXTERNAL_LIBRARIES)
endif
LIBRARIES := "$(LIBRARIES)"

JAVA_SRCS := $(wildcard $(SRC_DIR)/*.java)
JAVA_FLAGS += -d $(BIN_DIR) -cp $(LIBRARIES)




all:
	$(JAVAC) $(JAVA_FLAGS) $(JAVA_SRCS)




.PHONY: clean
clean:
	rm -rf $(EXEC) $(JAVA_SRCS) $(BIN_DIR)/*

.PHONY: spotless
spotless: clean
	spotless -r

.PHONY: test
test: all
	@$(JAVA) $(MAIN_CLASS)

.PHONY: run
run: all
	$(JAVA) -cp $(BIN_DIR) $(MAIN_CLASS)
