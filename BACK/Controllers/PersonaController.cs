using IntentoDespliegue.Data;
using IntentoDespliegue.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
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

    [HttpGet("{PersonaID}")]
    public async Task<IActionResult> BuscarPersona(int PersonaID)
    {
        var persona = await _context.Persona
            .AsNoTracking()
            .Where(p => p.PersonaID == PersonaID)
            .Select(p => new vistaPersona
            {
                PersonaID = p.PersonaID,
                Nombre = p.Nombre,
                Apellido = p.Apellido,
                Documento = p.Documento,
                Direccion = p.Direccion,
                Salario = p.Salario.ToString(),
                FechaFormateada = p.FechaNacimiento.ToString("dd/MM/yyyy")
            })
            .SingleOrDefaultAsync();

        return persona is null ? NotFound("No se encontró la persona") : Ok(persona);
    }

    [HttpPost]
    public async Task<IActionResult> CrearPersona([FromBody] Persona persona)
    {
        if (persona.FechaNacimiento == default)
        {
            return BadRequest("La fecha de nacimiento es obligatoria");
        }

        persona.Nombre = persona.Nombre.Trim();
        persona.Apellido = persona.Apellido.Trim();
        persona.Documento = persona.Documento.Trim();
        persona.Direccion = persona.Direccion.Trim();

        if (await ExisteDocumento(persona.Documento))
        {
            return Conflict("Ya existe una persona con ese documento");
        }

        _context.Persona.Add(persona);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException exception) when (EsDocumentoDuplicado(exception))
        {
            return Conflict("Ya existe una persona con ese documento");
        }

        return Ok("Persona creada correctamente");
    }



    [HttpPut("{PersonaID}")]
    public async Task<IActionResult> EditarPersona(int PersonaID, [FromBody] Persona persona)
    {
        var editarPersona = await _context.Persona
            .SingleOrDefaultAsync(e => e.PersonaID == PersonaID);

        if (editarPersona == null)
        {
            return NotFound("No se encontró la persona");
        }

        if (persona.FechaNacimiento == default)
        {
            return BadRequest("La fecha de nacimiento es obligatoria");
        }

        persona.Nombre = persona.Nombre.Trim();
        persona.Apellido = persona.Apellido.Trim();
        persona.Documento = persona.Documento.Trim();
        persona.Direccion = persona.Direccion.Trim();

        if (await ExisteDocumento(persona.Documento, PersonaID))
        {
            return Conflict("Ya existe una persona con ese documento");
        }

        editarPersona.Nombre = persona.Nombre;
        editarPersona.Apellido = persona.Apellido;
        editarPersona.Documento = persona.Documento;
        editarPersona.Direccion = persona.Direccion;
        editarPersona.Salario = persona.Salario;
        editarPersona.FechaNacimiento = persona.FechaNacimiento;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException exception) when (EsDocumentoDuplicado(exception))
        {
            return Conflict("Ya existe una persona con ese documento");
        }

        return Ok("Persona editada correctamente");
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

    private Task<bool> ExisteDocumento(string documento, int? personaId = null)
    {
        var documentoNormalizado = documento.ToUpper();

        return _context.Persona.AnyAsync(persona =>
            persona.Documento.Trim().ToUpper() == documentoNormalizado
            && (!personaId.HasValue || persona.PersonaID != personaId.Value));
    }

    private static bool EsDocumentoDuplicado(DbUpdateException exception)
    {
        return exception.GetBaseException() is SqlException sqlException
            && sqlException.Number is 2601 or 2627;
    }
}
