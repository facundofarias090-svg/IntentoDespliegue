using System.ComponentModel.DataAnnotations;

namespace IntentoDespliegue.Models;

public class Persona
{

    [Key]
    public int PersonaID { get; set; }

    [Required]
    public string Nombre { get; set; } = string.Empty;

    [Required]
    public string Apellido { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Documento { get; set; } = string.Empty;

    [Required]
    public string Direccion { get; set; } = string.Empty;

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
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
