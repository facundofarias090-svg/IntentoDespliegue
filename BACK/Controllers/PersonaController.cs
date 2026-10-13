using IntentoDespliegue.Data;
using IntentoDespliegue.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IntentoDespliegue.Controllers;
[Route("api/[controller]")]
[ApiController]

public class PersonaController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PersonaController(ApplicationDbContext context)
    {
        _context = context;
    }



    [HttpGet]
    public async Task<IActionResult> PersonaListado()
    {
        var persona = await _context.Persona.AsNoTracking().ToListAsync();

        var personaVista = persona.Select(p => new vistaPersona
        {
            PersonaID = p.PersonaID,
            Nombre = p.Nombre,
            Apellido = p.Apellido,
            Documento = p.Documento,
            Direccion = p.Direccion,
            Salario = p.Salario.ToString(),
            FechaFormateada = p.FechaNacimiento.ToString("dd/MM/yyyy")
        }).ToList();

        return Ok(personaVista);
    }


    [HttpPost]
    public async Task<IActionResult> CrearPersona([FromBody] Persona persona)
    {
       var nombreMayuscula = persona.Nombre.ToUpper().Trim();

       var personaExiste = await _context.Persona.AnyAsync(p => p.Nombre.ToUpper().Trim() == nombreMayuscula);

         if (!personaExiste)
          {
                var nuevaPersona = new Persona
                    {
                        Nombre = persona.Nombre,
                        Apellido = persona.Apellido,
                        Documento = persona.Documento,
                        Direccion = persona.Direccion,
                        Salario = persona.Salario,
                        FechaNacimiento = persona.FechaNacimiento
                    };

                _context.Persona.Add(nuevaPersona);
                await _context.SaveChangesAsync();
                return Ok("Persona creada correctamente");
          }

        return BadRequest("Ya existe una persona con ese nombre");
    }



    [HttpPut("{PersonaID}")]
    public async Task<IActionResult> EditarPersona(int PersonaID, [FromBody] Persona persona)
    {
        var nombreMayuscula = persona.Nombre.ToUpper().Trim();

            var editarPersona = await _context.Persona.Where(e => e.PersonaID == PersonaID).SingleOrDefaultAsync();

        if (editarPersona == null)
        {
            return NotFound("No se encontró la persona");
        };

            var personaExiste = await _context.Persona.AnyAsync(e => e.Nombre == nombreMayuscula && e.PersonaID != PersonaID);
        
        if (!personaExiste)
            {
                editarPersona.Nombre = persona.Nombre;
                editarPersona.Apellido = persona.Apellido;
                editarPersona.Documento = persona.Documento;
                editarPersona.Direccion = persona.Direccion;
                editarPersona.Salario = persona.Salario;
                editarPersona.FechaNacimiento = persona.FechaNacimiento;

                await _context.SaveChangesAsync();
                return Ok("Persona editada correctamente");
            }

        return BadRequest("Ya existe una persona con ese nombre");
    }

    [HttpDelete("{PersonaID}")]
    public async Task<IActionResult> EliminarPersona(int PersonaID)
    {
        var eliminarPersona = await _context.Persona.FindAsync(PersonaID);

        if (eliminarPersona == null)
        {
            return NotFound("No se encontró la persona");
        }

        _context.Persona.Remove(eliminarPersona);
        await _context.SaveChangesAsync();
        return Ok("Persona eliminada correctamente");
    }
}
