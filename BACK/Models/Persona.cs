using System.ComponentModel.DataAnnotations;

namespace IntentoDespliegue.Models;

public class Persona
{

    [Key]
    public int PersonaID { get; set; }
    public string Nombre { get; set; }
    public string Apellido { get; set; }
    public string Documento { get; set; }
    public string Direccion { get; set; }
    public decimal Salario { get; set; }
    public DateTime FechaNacimiento { get; set; }
}


public class vistaPersona
{
    public int PersonaID { get; set; }
    public string Nombre { get; set; }
    public string Apellido { get; set; }
    public string Documento { get; set; }
    public string Direccion { get; set; }
    public string Salario { get; set; }
    public string FechaFormateada { get; set; }
}

