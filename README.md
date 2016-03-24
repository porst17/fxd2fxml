fxd2fxml
========

This tool is an attempt to convert graphical asset files from the legacy
JavaFX 1.3.1 file format `.fxd/.fxz` to the FXML file format of JavaFX 2+.

The converter is not intended to be complete or robust. I needed to convert a
single very lengthy `.fxz` file and the current version did the job for me.

Hence, it is unlikely, that I will ever touch this code again, but I decided to
open source the it to get others started who need to convert legacy
JavaFX 1.3.1 stuff over to the new format.


Usage
-----

You need to run this tool with Java 1.7. Java 1.8 does not work.

```
JAVA_HOME=PATH_TO_JAVA_1_7_HOME ./gradlew clean run -Pinfile="infile.fxz" -Poutfile="outfile.fxml"
```


License
-------

Except from the JavaFX 1.3.1 runtime redistributable files located in the
`javafx-rt-1_3_1` directory, all the files in this repository are released under
Apache v2.0 license. The JavaFX 1.3.1 runtime redistributables are subject to
the [Oracle Binary Code License Agreement for Java SE and JavaFX Technologies](javafx-rt-1_3_1/LICENSE).
