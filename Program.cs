using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddRazorPages();
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

var npmOptions = new FileServerOptions();
npmOptions.FileProvider = new PhysicalFileProvider(Path.Combine(app.Environment.ContentRootPath, "node_modules"));
npmOptions.RequestPath = "/node_modules";
app.UseFileServer(npmOptions);

app.UseAuthorization();

app.MapRazorPages();
app.MapControllers();

app.Run();
