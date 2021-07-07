import mysql.connector
import csv

db = mysql.connector.connect(
        host="localhost",
        user="desa",
        passwd="Desatest01.",
        database="DIMAO_SRB",
        auth_plugin='mysql_native_password'
        )

mycursor = db.cursor()
print()


##---------Uso de excel----------

#rutas de los archivos para inserción
path1 = "TIPE3-FILL-BD-tusuario.csv"
path2 = "TIPE3-FILL-BD-tsector.csv"
path3 = "TIPE3-FILL-BD-tsubsector.csv"
path4 = "TIPE3-FILL-BD-tvivienda.csv"
path5 = "TIPE3-FILL-BD-talerta.csv"
path6 = "TIPE3-FILL-BD-tcorroboracion.csv"
path7 = "TIPE3-FILL-BD-tdesincripcion.csv"

#USUARIO
def insertarUsuario():
    firstline=False
    with open(path1, newline='') as csvfile:
        spamreader = csv.reader(csvfile, delimiter=',',quotechar='|')
        for row in spamreader: #recorrer lineas, que en si row seria el array con los elementos de la linea
            if(firstline==True):
                mycursor.execute("insert into usuario(run,nombre,tipo_usuario,email,contrasena) values ('{}','{}','{}','{}','{}')".format(row[0],row[1],row[2],row[3],row[4])) #ejecutar dml
            else: firstline=True
    db.commit() #confirmar los cambios hechos a la base de datos

#VIVIENDA
def insertarVivienda():
    firstline=False
    with open(path4, newline='') as csvfile:
        spamreader = csv.reader(csvfile, delimiter=',',quotechar='|')
        for row in spamreader: #recorrer lineas, que en si row seria el array con los elementos de la linea
            if(firstline==True):
                mycursor.execute("insert into vivienda(rol,domicilio, num_habitantes, telefono, fecha_incorporacion, subsector_id,run) values ({},'{}',{},'{}','{}',{},'{}')".format(row[0],row[1],row[2],row[3],row[4],row[5],row[6])) #ejecutar dml
            else: firstline=True
    db.commit() #confirmar los cambios hechos a la base de datos

#SECTOR
def insertarSector():
    firstline=False
    with open(path2, newline='') as csvfile:
        spamreader = csv.reader(csvfile, delimiter=',',quotechar='|')
        for row in spamreader: #recorrer lineas, que en si row seria el array con los elementos de la linea
            if(firstline==True):
                mycursor.execute("insert into sector(sector_id,nombre) values ({},'{}')".format(row[0],row[1])) #ejecutar dml
            else: firstline=True
    db.commit() #confirmar los cambios hechos a la base de datos

#SUBSECTOR
def insertarSubsector():
    firstline=False
    with open(path3, newline='') as csvfile:
        spamreader = csv.reader(csvfile, delimiter=',',quotechar='|')
        for row in spamreader: #recorrer lineas, que en si row seria el array con los elementos de la linea
            if(firstline==True):
                mycursor.execute("insert into subsector(nombre, sector_id) values ('{}',{})".format(row[1],row[2])) #ejecutar dml
            else: firstline=True
    db.commit() #confirmar los cambios hechos a la base de datos

#ALERTA
def insertarAlerta():
    firstline=False
    with open(path5, newline='') as csvfile:
        spamreader = csv.reader(csvfile, delimiter=',',quotechar='|')
        for row in spamreader: #recorrer lineas, que en si row seria el array con los elementos de la linea
            if(firstline==True):
                mycursor.execute("insert into alerta(fecha_alerta,rol,estado) values ('{}',{},'{}')".format(row[0],row[1],row[2])) #ejecutar dml
            else: firstline=True
    db.commit() #confirmar los cambios hechos a la base de datos

#Corroboracion
def insertarCorroboracion():
    firstline=False
    with open(path6, newline='') as csvfile:
        spamreader = csv.reader(csvfile, delimiter=',',quotechar='|')
        for row in spamreader: #recorrer lineas, que en si row seria el array con los elementos de la linea
            if(firstline==True):
                mycursor.execute("insert into corroboracion(fecha_reciclaje,rol) values ('{}',{})".format(row[0],row[1])) #ejecutar dml
            else: firstline=True
    db.commit() #confirmar los cambios hechos a la base de datos

#desincripcion
def insertarDesinscripcion():
    firstline=False
    with open(path7, newline='') as csvfile:
        spamreader = csv.reader(csvfile, delimiter=',',quotechar='|')
        for row in spamreader: #recorrer lineas, que en si row seria el array con los elementos de la linea
            if(firstline==True):
                mycursor.execute("insert into desinscripcion(run,motivo) values ('{}','{}')".format(row[0],row[1])) #ejecutar dml
            else: firstline=True
    db.commit() #confirmar los cambios hechos a la base de datos

#insertarSector()
#insertarSubsector()
#insertarUsuario()
#insertarVivienda()
#insertarAlerta()
#insertarCorroboracion()
insertarDesinscripcion()
db.close()
