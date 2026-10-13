using Microsoft.EntityFrameworkCore;
using IntentoDespliegue.Models;

namespace IntentoDespliegue.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Persona> Persona { get; set; }

}